import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData, useFlatRecords } from '../context/DataContext.jsx'
import { overallStats, subjectStats, forecastAttend, forecastSkip, safeSkips } from '../utils/attendance'
import ForecastCard from '../components/ForecastCard.jsx'
import './Forecast.css'

const OVERALL_TARGET = 75

export default function Forecast() {
  const { subjects } = useData()
  const flat = useFlatRecords()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('subject')

  const overall = useMemo(() => overallStats(flat), [flat])
  const overallSafe = safeSkips(overall.attended, overall.total, OVERALL_TARGET)

  useEffect(() => {
    if (!highlightId) return
    const el = document.getElementById(`forecast-${highlightId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightId])

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-subtitle">What if…</span>
        <h1 className="page-title">Forecast</h1>
      </div>

      <div className="card overall-forecast">
        <div className="eyebrow">Overall Forecast</div>
        <div className="overall-forecast-pct">{overall.total === 0 ? '—' : `${overall.pct}%`}</div>
        <div className="overall-forecast-target">Target {OVERALL_TARGET}%</div>

        <div className="overall-forecast-scenarios">
          <div className="scenario-row">
            <span>If you attend next 5</span>
            <span className="scenario-value scenario-value--up">→ {forecastAttend(overall.attended, overall.total, 5)}%</span>
          </div>
          <div className="scenario-row">
            <span>If you skip next 3</span>
            <span className="scenario-value">→ {forecastSkip(overall.attended, overall.total, 3)}%</span>
          </div>
          <div className="scenario-row">
            <span>If you skip next 10</span>
            <span
              className={`scenario-value ${forecastSkip(overall.attended, overall.total, 10) < OVERALL_TARGET ? 'scenario-value--down' : ''}`}
            >
              → {forecastSkip(overall.attended, overall.total, 10)}%
              {forecastSkip(overall.attended, overall.total, 10) < OVERALL_TARGET ? ' 🔴' : ''}
            </span>
          </div>
        </div>

        <div className="overall-forecast-safe">
          <span className="eyebrow">Safe skips</span>
          <span className="overall-forecast-safe-value">{overallSafe.unlimited ? 'No limit' : overallSafe.count}</span>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Subjects</div>
        <div className="forecast-grid">
          {subjects.map((subject) => {
            const stats = subjectStats(subject.id, flat)
            return (
              <ForecastCard
                key={subject.id}
                id={`forecast-${subject.id}`}
                title={subject.name}
                current={stats.pct}
                target={subject.target}
                attended={stats.attended}
                total={stats.total}
                highlighted={highlightId === subject.id}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
