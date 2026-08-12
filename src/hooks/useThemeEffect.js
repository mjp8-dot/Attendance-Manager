import { useEffect } from 'react'
import { useData } from '../context/DataContext.jsx'

/** Applies theme/color-mode/animation settings to the document root as data attributes. */
export function useThemeEffect() {
  const { settings } = useData()

  useEffect(() => {
    const root = document.documentElement
    const resolveTheme = () => {
      if (settings.theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
      }
      return settings.theme
    }

    const apply = () => {
      root.setAttribute('data-theme', resolveTheme())
    }
    apply()

    root.setAttribute('data-color-mode', settings.colorMode)
    root.setAttribute('data-animations', settings.animations ? 'on' : 'off')
    root.setAttribute('data-compact', settings.compactMode ? 'on' : 'off')

    if (settings.theme !== 'system') return undefined

    const mq = window.matchMedia('(prefers-color-scheme: light)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [settings.theme, settings.colorMode, settings.animations, settings.compactMode])
}
