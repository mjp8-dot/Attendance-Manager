import { useData, useDataDispatch } from '../context/DataContext.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import Toggle from '../components/Toggle.jsx'
import './Settings.css'

function SettingsGroup({ title, children }) {
  return (
    <div className="section">
      <div className="section-title">{title}</div>
      <div className="card settings-group">{children}</div>
    </div>
  )
}

function SettingsRow({ label, children }) {
  return (
    <div className="settings-row">
      <span className="settings-row-label">{label}</span>
      {children}
    </div>
  )
}

export default function Settings() {
  const { settings } = useData()
  const dispatch = useDataDispatch()

  function update(patch) {
    dispatch({ type: 'UPDATE_SETTINGS', patch })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <span className="page-subtitle">Make it yours</span>
      </div>

      <div className="desktop-grid">
        <SettingsGroup title="Appearance">
          <SettingsRow label="Theme">
            <SegmentedControl
              value={settings.theme}
              onChange={(theme) => update({ theme })}
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
                { value: 'system', label: 'System' },
              ]}
            />
          </SettingsRow>
          <SettingsRow label="Color mode">
            <SegmentedControl
              value={settings.colorMode}
              onChange={(colorMode) => update({ colorMode })}
              options={[
                { value: 'color', label: 'Color' },
                { value: 'mono', label: 'Mono' },
              ]}
            />
          </SettingsRow>
        </SettingsGroup>

        <SettingsGroup title="Interface">
          <SettingsRow label="Animations">
            <Toggle checked={settings.animations} onChange={(animations) => update({ animations })} label="Animations" />
          </SettingsRow>
          <SettingsRow label="Compact mode">
            <Toggle checked={settings.compactMode} onChange={(compactMode) => update({ compactMode })} label="Compact mode" />
          </SettingsRow>
          <SettingsRow label="24-hour time">
            <Toggle checked={settings.hour24} onChange={(hour24) => update({ hour24 })} label="24-hour time" />
          </SettingsRow>
        </SettingsGroup>

        <SettingsGroup title="Personality">
          <SettingsRow label="Sarcasm">
            <Toggle checked={settings.sarcasm} onChange={(sarcasm) => update({ sarcasm })} label="Sarcasm" />
          </SettingsRow>
          {settings.sarcasm && (
            <SettingsRow label="Intensity">
              <SegmentedControl
                value={settings.intensity}
                onChange={(intensity) => update({ intensity })}
                options={[
                  { value: 'mild', label: 'Mild' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'unhinged', label: 'Unhinged' },
                ]}
              />
            </SettingsRow>
          )}
        </SettingsGroup>
      </div>
    </div>
  )
}
