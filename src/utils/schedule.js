import { generateVacancies } from './attendance'

/** Timetable slots for a given JS weekday (0=Sun..6=Sat), sorted by start time. */
export function slotsForDay(timetable, weekday) {
  return timetable.filter((s) => s.day === weekday).sort((a, b) => a.start.localeCompare(b.start))
}

/**
 * Joins a day's timetable slots with subjects + that date's recorded status.
 * Returns [{ slot, subject, status }] where status is 'present' | 'absent' |
 * 'cancelled' | 'unmarked'.
 */
export function classesForDate(timetable, subjects, recordsForDate, weekday) {
  const slots = slotsForDay(timetable, weekday)
  return slots.map((slot) => {
    const subject = subjects.find((s) => s.id === slot.subjectId)
    const record = recordsForDate?.[slot.id]
    return { slot, subject, status: record?.status ?? 'unmarked' }
  })
}

/**
 * Builds the full 08:00-17:00 timeline for a day: classes interleaved with
 * auto-generated vacancy blocks, sorted by start time.
 */
export function dayTimeline(timetable, subjects, recordsForDate, weekday) {
  const classes = classesForDate(timetable, subjects, recordsForDate, weekday)
  const vacancies = generateVacancies(classes.map((c) => c.slot)).map((v) => ({
    type: 'vacancy',
    start: v.start,
    end: v.end,
  }))
  const classItems = classes.map((c) => ({ type: 'class', start: c.slot.start, end: c.slot.end, ...c }))
  return [...classItems, ...vacancies].sort((a, b) => a.start.localeCompare(b.start))
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const WEEKDAY_LABELS_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
