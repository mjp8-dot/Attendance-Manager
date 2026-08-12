// Pure attendance calculation functions. No React, no storage, no side effects.
// All functions guard against NaN/Infinity per spec: 0 classes, 0%/100% targets, etc.

/** Round to 1 decimal place, always a finite number. */
export function round1(n) {
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 10) / 10
}

/** (attended / total) * 100, or 0 when total is 0 (never NaN). */
export function percentage(attended, total) {
  if (!total || total <= 0) return 0
  return round1((attended / total) * 100)
}

/**
 * How many more classes can be missed and stay at/above targetPct.
 * Returns { unlimited: true } when targetPct <= 0 (anything is "safe").
 * Otherwise returns { unlimited: false, count } where count >= 0.
 */
export function safeSkips(attended, total, targetPct) {
  if (targetPct <= 0) return { unlimited: true, count: 0 }
  if (targetPct >= 100) {
    // Can only stay at 100% by never missing again.
    return { unlimited: false, count: attended >= total ? 0 : 0 }
  }
  // attended / (total + n) >= target/100  =>  n <= attended*100/target - total
  const maxN = attended * (100 / targetPct) - total
  const count = Math.max(0, Math.floor(maxN + 1e-9))
  return { unlimited: false, count }
}

/**
 * How many of the NEXT classes must be attended (consecutively, no more misses)
 * to reach targetPct.
 * Returns { reachable: false } when target is 100% and there is already at least
 * one recorded miss (mathematically unreachable by attending alone).
 * Otherwise returns { reachable: true, count } where count >= 0.
 */
export function recoveryNeeded(attended, total, targetPct) {
  if (total === 0) return { reachable: true, count: 0 }
  if (attended >= total * (targetPct / 100) - 1e-9) {
    return { reachable: true, count: 0 }
  }
  if (targetPct >= 100) {
    return { reachable: attended >= total, count: 0 }
  }
  // (attended + n) / (total + n) >= target/100
  // n >= (target/100 * total - attended) / (1 - target/100)
  const t = targetPct / 100
  const n = (t * total - attended) / (1 - t)
  return { reachable: true, count: Math.max(0, Math.ceil(n - 1e-9)) }
}

/** Projected percentage if `n` more classes are attended. */
export function forecastAttend(attended, total, n) {
  const safeN = Math.max(0, n | 0)
  return percentage(attended + safeN, total + safeN)
}

/** Projected percentage if `n` more classes are skipped. */
export function forecastSkip(attended, total, n) {
  const safeN = Math.max(0, n | 0)
  return percentage(attended, total + safeN)
}

/** Attendance status classification relative to target. */
export function statusFor(pct, targetPct) {
  if (pct >= targetPct) return 'safe'
  if (pct >= targetPct - 10) return 'warning'
  return 'danger'
}

/**
 * Aggregate attended/missed/total/pct for a single subject from the flat
 * records list ({ subjectId, status }[]). Cancelled classes and vacancies
 * are simply never present as records with status present/absent, so they
 * naturally do not count.
 */
export function subjectStats(subjectId, records) {
  let attended = 0
  let missed = 0
  for (const r of records) {
    if (r.subjectId !== subjectId) continue
    if (r.status === 'present') attended++
    else if (r.status === 'absent') missed++
  }
  const total = attended + missed
  return { attended, missed, total, pct: percentage(attended, total) }
}

/** Aggregate attended/missed/total/pct across all subjects. */
export function overallStats(records) {
  let attended = 0
  let missed = 0
  for (const r of records) {
    if (r.status === 'present') attended++
    else if (r.status === 'absent') missed++
  }
  const total = attended + missed
  return { attended, missed, total, pct: percentage(attended, total) }
}

const DAY_MS = 24 * 60 * 60 * 1000

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/**
 * Given the timetable slots scheduled for one weekday (each with start/end
 * "HH:MM"), compute the vacant gaps within the fixed 08:00-17:00 window.
 * Slots are assumed non-overlapping; overlaps are resolved by sorting on
 * start time and skipping gaps that would go negative.
 */
export function generateVacancies(slotsForDay, dayStart = '08:00', dayEnd = '17:00') {
  const start = toMinutes(dayStart)
  const end = toMinutes(dayEnd)
  const sorted = [...slotsForDay].sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
  const vacancies = []
  let cursor = start
  for (const slot of sorted) {
    const slotStart = Math.max(toMinutes(slot.start), start)
    const slotEnd = Math.min(toMinutes(slot.end), end)
    if (slotStart > cursor) {
      vacancies.push({ start: minutesToHHMM(cursor), end: minutesToHHMM(slotStart) })
    }
    cursor = Math.max(cursor, slotEnd)
  }
  if (cursor < end) {
    vacancies.push({ start: minutesToHHMM(cursor), end: minutesToHHMM(end) })
  }
  return vacancies.filter((v) => toMinutes(v.end) > toMinutes(v.start))
}

export function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function durationMinutes(start, end) {
  return Math.max(0, toMinutes(end) - toMinutes(start))
}

/** Date helpers kept here so both storage and UI share the same date-key format. */
export function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date, n) {
  return new Date(date.getTime() + n * DAY_MS)
}
