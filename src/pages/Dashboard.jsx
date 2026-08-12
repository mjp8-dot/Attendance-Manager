import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData, useFlatRecords } from '../context/DataContext.jsx'
import { overallStats, subjectStats, dateKey } from '../utils/attendance'
import { classesForDate } from '../utils/schedule'
import { formatTime } from '../utils/format'
import { greeting } from '../utils/personality'
import OverallCard from '../components/OverallCard.jsx'
import StatCard from '../components/StatCard.jsx'
import SubjectCard from '../components/SubjectCard.jsx'
import { CheckIcon, CrossIcon, SleepIcon } from '../components/icons.jsx'
import './Dashboard.css'

const OVERALL_TARGET = 75

export default function Dashboard() {
  const { subjects, timetable, records, settings } = useData()
  const flat = useFlatRecords()

  const today = useMemo(() => new Date(), [])
  const todayKey = dateKey(today)
  const todayRecords = records[todayKey]

  const overall = useMemo(() => overallStats(flat), [flat])
  const todaysClasses = useMemo(
    () => classesForDate(timetable, subjects, todayRecords, today.getDay()),
    [timetable, subjects, todayRecords, today],
  )

  const subjectsWithStats = useMemo(
    () => subjects.map((subject) => ({ subject, stats: subjectStats(subject.id, flat) })),
    [subjects, flat],
  )

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-subtitle">{greeting(settings, today.getDate())}</span>
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="desktop-grid">
        <div className="section">
          <OverallCard pct={overall.pct} target={OVERALL_TARGET} total={overall.total} />
          <div className="grid-2">
            <StatCard label="Attended" value={overall.attended} accent="green" />
            <StatCard label="Missed" value={overall.missed} accent="red" />
          </div>
        </div>

        <div className="section">
          <div className="section-title">Today</div>
          <div className="card today-card">
            {todaysClasses.length === 0 ? (
              <div className="today-empty">No classes today. Enjoy it.</div>
            ) : (
              <ul className="today-list">
                {todaysClasses.map(({ slot, subject, status }) => (
                  <li key={slot.id} className="today-row">
                    <span className="today-time">{formatTime(slot.start, settings.hour24)}</span>
                    <span className="today-name">{subject?.name ?? 'Unknown'}</span>
                    {status === 'present' && <CheckIcon className="today-status today-status--green" />}
                    {status === 'absent' && <CrossIcon className="today-status today-status--red" />}
                    {status === 'unmarked' && <SleepIcon className="today-status today-status--muted" />}
                    {status === 'cancelled' && <span className="today-cancelled">Cancelled</span>}
                  </li>
                ))}
              </ul>
            )}
            <Link to="/schedule" className="today-link">
              Open schedule →
            </Link>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Subjects</div>
        {subjects.length === 0 ? (
          <div className="card">
            No subjects yet.{' '}
            <Link to="/edit" className="today-link">
              Add one
            </Link>
            .
          </div>
        ) : (
          <div className="subject-grid">
            {subjectsWithStats.map(({ subject, stats }) => (
              <SubjectCard key={subject.id} subject={subject} stats={stats} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
