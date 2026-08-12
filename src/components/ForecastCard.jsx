import { useState } from 'react'
import { forecastAttend, forecastSkip, statusFor } from '../utils/attendance'
import SegmentedControl from './SegmentedControl.jsx'
import './ForecastCard.css'

const STATUS_COLOR = { safe: 'green', warning: 'yellow', danger: 'red' }

export default function ForecastCard({ title, current, target, attended, total, highlighted, id }) {
  const [mode, setMode] = useState('attend')
  const [count, setCount] = useState(3)

  const projected = mode === 'attend' ? forecastAttend(attended, total, count) : forecastSkip(attended, total, count)
  const status = total + count === 0 ? 'safe' : statusFor(projected, target)

  return (
    <div id={id} className={`card forecast-card${highlighted ? ' forecast-card--highlighted' : ''}`}>
      <div className="eyebrow">{title}</div>
      <div className="forecast-card-row">
        <div>
          <div className="forecast-card-label">Current</div>
          <div className="forecast-card-number">{total === 0 ? '—' : `${current}%`}</div>
        </div>
        <div>
          <div className="forecast-card-label">Target</div>
          <div className="forecast-card-number forecast-card-number--muted">{target}%</div>
        </div>
      </div>

      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          { value: 'attend', label: 'ATTEND' },
          { value: 'skip', label: 'SKIP' },
        ]}
      />

      <div className="forecast-stepper">
        <button type="button" onClick={() => setCount((c) => Math.max(0, c - 1))} aria-label="Decrease">
          −
        </button>
        <span>{count}</span>
        <button type="button" onClick={() => setCount((c) => Math.min(50, c + 1))} aria-label="Increase">
          +
        </button>
      </div>

      <div className="forecast-projected">
        <div className="forecast-card-label">Projected</div>
        <div className="forecast-projected-row">
          <span className="forecast-projected-number">{projected}%</span>
          <span className={`pill pill--${STATUS_COLOR[status]}`}>{status === 'safe' ? 'SAFE' : status === 'warning' ? 'CLOSE' : 'BELOW'}</span>
        </div>
        {status === 'danger' && mode === 'skip' && (
          <div className="forecast-warning">Skipping {count} more drops you below target.</div>
        )}
      </div>
    </div>
  )
}
