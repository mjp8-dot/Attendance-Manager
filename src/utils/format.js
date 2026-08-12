/** Formats an internal "HH:MM" (24h) string for display, honoring the 24-hour setting. */
export function formatTime(hhmm, hour24 = false) {
  if (!hhmm) return ''
  if (hour24) return hhmm
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}
