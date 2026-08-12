import { durationMinutes } from '../utils/attendance'
import { formatTime } from '../utils/format'
import { useData } from '../context/DataContext.jsx'
import { CheckIcon, CrossIcon } from './icons.jsx'
import './ClassCard.css'

export default function ClassCard({ slot, subject, status, isNow, onMark, onCancel, onUncancel }) {
  const { settings } = useData()
  const minutes = durationMinutes(slot.start, slot.end)
  const heightHint = Math.min(180, Math.max(84, minutes * 1.3))
  const timeLabel = `${formatTime(slot.start, settings.hour24)} – ${formatTime(slot.end, settings.hour24)}`

  if (status === 'cancelled') {
    return (
      <div className="card class-card class-card--cancelled" style={{ minHeight: heightHint }}>
        <div className="class-card-top">
          <span className="class-card-name">{subject?.name ?? 'Unknown'}</span>
          <span className="pill pill--orange">CANCELLED</span>
        </div>
        <div className="class-card-meta">
          {timeLabel}
          {slot.room && ` · Room ${slot.room}`}
        </div>
        <button type="button" className="class-card-uncancel" onClick={onUncancel}>
          Undo cancellation
        </button>
      </div>
    )
  }

  return (
    <div
      className={`card class-card${isNow ? ' class-card--now' : ''} class-card--${subject?.color ?? 'cyan'}`}
      style={{ minHeight: heightHint }}
    >
      <div className="class-card-top">
        <span className="class-card-name">{subject?.name ?? 'Unknown'}</span>
        {isNow && <span className="pill pill--cyan">NOW</span>}
      </div>
      <div className="class-card-meta">
        {timeLabel}
        {slot.room && ` · Room ${slot.room}`}
      </div>
      <div className="class-card-actions">
        <button
          type="button"
          className={`class-btn class-btn--present${status === 'present' ? ' class-btn--active' : ''}`}
          onClick={() => onMark(status === 'present' ? 'unmark' : 'present')}
        >
          <CheckIcon width={16} height={16} /> Present
        </button>
        <button
          type="button"
          className={`class-btn class-btn--absent${status === 'absent' ? ' class-btn--active' : ''}`}
          onClick={() => onMark(status === 'absent' ? 'unmark' : 'absent')}
        >
          <CrossIcon width={16} height={16} /> Absent
        </button>
        {onCancel && (
          <button type="button" className="class-card-cancel" onClick={onCancel}>
            Cancel class
          </button>
        )}
      </div>
    </div>
  )
}
