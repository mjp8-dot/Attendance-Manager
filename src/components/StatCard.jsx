import './StatCard.css'

export default function StatCard({ label, value, accent, sub }) {
  return (
    <div className={`card stat-card${accent ? ` stat-card--${accent}` : ''}`}>
      <div className="eyebrow">{label}</div>
      <div className="stat-card-value">{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  )
}
