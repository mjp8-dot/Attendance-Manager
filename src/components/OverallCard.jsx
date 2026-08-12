import { statusFor } from '../utils/attendance'
import './OverallCard.css'

const STATUS_LABEL = { safe: 'ON TRACK', warning: 'CLOSE TO TARGET', danger: 'BELOW TARGET' }
const STATUS_COLOR = { safe: 'green', warning: 'yellow', danger: 'red' }

export default function OverallCard({ pct, target, total }) {
  const status = total === 0 ? 'safe' : statusFor(pct, target)
  const delta = pct - target
  const deltaLabel = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`

  return (
    <div className="card overall-card">
      <div className="eyebrow">Overall Attendance</div>
      <div className="overall-card-pct">{total === 0 ? '—' : `${pct}%`}</div>
      <div className="overall-card-row">
        <span className="overall-card-target">Target {target}%</span>
        {total > 0 && (
          <span className={`overall-card-delta overall-card-delta--${delta >= 0 ? 'up' : 'down'}`}>
            {deltaLabel}
          </span>
        )}
      </div>
      <span className={`pill pill--${STATUS_COLOR[status]} overall-card-status`}>
        {total === 0 ? 'NO DATA YET' : STATUS_LABEL[status]}
      </span>
    </div>
  )
}
