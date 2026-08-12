// Demo data so the app is never an empty shell on first load.
// Day numbers follow JS Date convention: 0 = Sunday ... 6 = Saturday.

const MON = 1
const TUE = 2
const WED = 3
const THU = 4
const FRI = 5

export const SUBJECT_COLORS = ['green', 'purple', 'cyan', 'orange', 'yellow', 'blue']

export function seedSubjects() {
  return [
    { id: 'sub-ds', name: 'Data Structures', target: 75, color: 'green' },
    { id: 'sub-dbms', name: 'DBMS', target: 80, color: 'cyan' },
    { id: 'sub-java', name: 'Java', target: 75, color: 'orange' },
    { id: 'sub-os', name: 'Operating Systems', target: 75, color: 'purple' },
    { id: 'sub-math', name: 'Engineering Math', target: 70, color: 'yellow' },
  ]
}

export function seedTimetable() {
  return [
    { id: 'tt-1', subjectId: 'sub-ds', day: MON, start: '08:30', end: '09:30', room: '302' },
    { id: 'tt-2', subjectId: 'sub-dbms', day: MON, start: '09:30', end: '10:30', room: '201' },
    { id: 'tt-3', subjectId: 'sub-java', day: MON, start: '11:30', end: '12:30', room: '105' },
    { id: 'tt-4', subjectId: 'sub-os', day: MON, start: '14:00', end: '15:00', room: '210' },

    { id: 'tt-5', subjectId: 'sub-math', day: TUE, start: '08:30', end: '09:30', room: '110' },
    { id: 'tt-6', subjectId: 'sub-ds', day: TUE, start: '09:30', end: '10:30', room: '302' },
    { id: 'tt-7', subjectId: 'sub-dbms', day: TUE, start: '10:30', end: '11:30', room: '201' },
    { id: 'tt-8', subjectId: 'sub-java', day: TUE, start: '15:00', end: '16:00', room: '105' },

    { id: 'tt-9', subjectId: 'sub-os', day: WED, start: '08:30', end: '09:30', room: '210' },
    { id: 'tt-10', subjectId: 'sub-math', day: WED, start: '09:30', end: '10:30', room: '110' },
    { id: 'tt-11', subjectId: 'sub-ds', day: WED, start: '12:30', end: '13:30', room: '302' },

    { id: 'tt-12', subjectId: 'sub-dbms', day: THU, start: '08:30', end: '09:30', room: '201' },
    { id: 'tt-13', subjectId: 'sub-java', day: THU, start: '09:30', end: '10:30', room: '105' },
    { id: 'tt-14', subjectId: 'sub-os', day: THU, start: '11:30', end: '12:30', room: '210' },
    { id: 'tt-15', subjectId: 'sub-math', day: THU, start: '14:00', end: '15:00', room: '110' },

    { id: 'tt-16', subjectId: 'sub-ds', day: FRI, start: '08:30', end: '09:30', room: '302' },
    { id: 'tt-17', subjectId: 'sub-java', day: FRI, start: '10:30', end: '11:30', room: '105' },
    { id: 'tt-18', subjectId: 'sub-dbms', day: FRI, start: '13:30', end: '14:30', room: '201' },
  ]
}

function dk(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Fabricate ~4 weeks of plausible history so the dashboard/forecast pages
 * have real numbers to show on first launch, with Java deliberately trending
 * below target and DS comfortably above it.
 */
export function seedRecords(subjects, timetable) {
  const records = {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let back = 28; back >= 1; back--) {
    const date = new Date(today.getTime() - back * 24 * 60 * 60 * 1000)
    const day = date.getDay()
    const slots = timetable.filter((s) => s.day === day)
    if (slots.length === 0) continue
    const key = dk(date)
    records[key] = {}
    for (const slot of slots) {
      // Java skews absent more often; everything else skews present.
      const isJava = slot.subjectId === 'sub-java'
      const roll = Math.random()
      const status = isJava ? (roll < 0.42 ? 'absent' : 'present') : roll < 0.12 ? 'absent' : 'present'
      records[key][slot.id] = {
        subjectId: slot.subjectId,
        subjectName: subjects.find((s) => s.id === slot.subjectId)?.name ?? 'Unknown',
        status,
        markedAt: date.toISOString(),
      }
    }
  }
  return records
}

export function seedSettings() {
  return {
    theme: 'dark',
    colorMode: 'color',
    animations: true,
    compactMode: false,
    hour24: false,
    sarcasm: true,
    intensity: 'normal',
  }
}

export function buildSeedData() {
  const subjects = seedSubjects()
  const timetable = seedTimetable()
  return {
    subjects,
    timetable,
    records: seedRecords(subjects, timetable),
    settings: seedSettings(),
  }
}
