import { NavLink } from 'react-router-dom'
import { HomeIcon, ScheduleIcon, ForecastIcon, EditIcon, SettingsIcon } from './icons.jsx'
import './Nav.css'

const ITEMS = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/schedule', label: 'Schedule', Icon: ScheduleIcon },
  { to: '/forecast', label: 'Forecast', Icon: ForecastIcon },
  { to: '/edit', label: 'Edit', Icon: EditIcon },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
]

export default function Nav() {
  return (
    <nav className="nav" aria-label="Primary">
      {ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}>
          <Icon className="nav-icon" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
