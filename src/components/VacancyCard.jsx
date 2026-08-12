import { durationMinutes } from '../utils/attendance'
import { formatTime } from '../utils/format'
import { useData } from '../context/DataContext.jsx'
import { vacancyLine } from '../utils/personality'
import { SleepIcon } from './icons.jsx'
import './VacancyCard.css'

export default function VacancyCard({ start, end, isNow }) {
  const { settings } = useData()
  const minutes = durationMinutes(start, end)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const label = hours > 0 ? `${hours}h${mins ? ` ${mins}m` : ''} free` : `${mins}m free`
  const heightHint = Math.min(140, Math.max(60, minutes * 1.3))

  return (
    <div className={`vacancy-card${isNow ? ' vacancy-card--now' : ''}`} style={{ minHeight: heightHint }}>
      <SleepIcon className="vacancy-icon" />
      <div className="vacancy-body">
        <div className="vacancy-title">VACANT</div>
        <div className="vacancy-meta">
          {formatTime(start, settings.hour24)} – {formatTime(end, settings.hour24)} · {label}
        </div>
        <div className="vacancy-line">{vacancyLine(settings, `${start}-${end}`)}</div>
      </div>
    </div>
  )
}
