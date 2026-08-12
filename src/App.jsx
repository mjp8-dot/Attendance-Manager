import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Schedule from './pages/Schedule.jsx'
import Forecast from './pages/Forecast.jsx'
import Edit from './pages/Edit.jsx'
import Settings from './pages/Settings.jsx'
import { useThemeEffect } from './hooks/useThemeEffect.js'
import './App.css'

export default function App() {
  useThemeEffect()

  return (
    <div className="app-shell">
      <Nav />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/edit" element={<Edit />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
