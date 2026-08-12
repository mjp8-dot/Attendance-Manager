import { buildSeedData } from './seed'

const STORAGE_KEY = 'attendance-tracker-data-v1'

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildSeedData()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return buildSeedData()
    return {
      subjects: parsed.subjects ?? [],
      timetable: parsed.timetable ?? [],
      records: parsed.records ?? {},
      settings: { ...buildSeedData().settings, ...(parsed.settings ?? {}) },
    }
  } catch {
    return buildSeedData()
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable (private browsing, quota) — fail silently,
    // the in-memory state still works for the rest of the session.
  }
}
