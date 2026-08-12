import { Link } from 'react-router-dom'
import { statusFor, safeSkips, recoveryNeeded } from '../utils/attendance'
import './SubjectCard.css'

const DOT_COLOR = { safe: 'green', warning: 'yellow', danger: 'red' }

export default function SubjectCard({ subject, stats }) {
  const { attended, missed, total, pct } = stats
  const status = total === 0 ? 'safe' : statusFor(pct, subject.target)

  let recoveryBlock = null
  if (total > 0) {
    if (status === 'danger' || status === 'warning') {
      const r = recoveryNeeded(attended, total, subject.target)
      recoveryBlock = (
        <>
          <div className="eyebrow">Recovery</div>
          <div className="subject-card-metric">
            {r.reachable ? `Attend next ${r.count} class${r.count === 1 ? '' : 'es'}` : 'Not mathematically reachable'}
          </div>
        </>
      )
    } else {
      const s = safeSkips(attended, total, subject.target)
      recoveryBlock = (
        <>
          <div className="eyebrow">Safe skips</div>
          <div className="subject-card-metric">{s.unlimited ? 'No limit' : `${s.count} class${s.count === 1 ? '' : 'es'}`}</div>
        </>
      )
    }
  }

  return (
    <Link to={`/forecast?subject=${subject.id}`} className={`card subject-card subject-card--${subject.color ?? 'cyan'}`}>
      <div className="subject-card-top">
        <span className="subject-card-name">{subject.name}</span>
        <span className={`subject-card-dot subject-card-dot--${DOT_COLOR[status]}`} />
      </div>
      <div className="subject-card-pct">{total === 0 ? '—' : `${pct}%`}</div>
      <div className="subject-card-target">Target {subject.target}%</div>
      <div className="subject-card-counts">
        {total === 0 ? 'No classes recorded yet' : `${attended} attended · ${missed} missed`}
      </div>
      {recoveryBlock && <div className="subject-card-recovery">{recoveryBlock}</div>}
    </Link>
  )
}
