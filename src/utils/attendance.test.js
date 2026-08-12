import { describe, it, expect } from 'vitest'
import {
  percentage,
  safeSkips,
  recoveryNeeded,
  forecastAttend,
  forecastSkip,
  statusFor,
  subjectStats,
  overallStats,
  generateVacancies,
  durationMinutes,
} from './attendance'

describe('percentage', () => {
  it('computes attended/total * 100', () => {
    expect(percentage(40, 50)).toBe(80)
    expect(percentage(1, 3)).toBeCloseTo(33.3, 1)
  })

  it('never produces NaN for 0 total', () => {
    expect(percentage(0, 0)).toBe(0)
    expect(Number.isFinite(percentage(0, 0))).toBe(true)
  })

  it('handles 100%', () => {
    expect(percentage(10, 10)).toBe(100)
  })
})

describe('safeSkips', () => {
  it('computes safe skip count above target', () => {
    // 42/50 = 84%, target 75%. Max total where 42/total >= 0.75 -> total <= 56 -> 6 more classes.
    const r = safeSkips(42, 50, 75)
    expect(r.unlimited).toBe(false)
    expect(r.count).toBe(6)
  })

  it('returns 0 when exactly at target', () => {
    // 3/4 = 75%, target 75. total+n <= 4 -> n=0
    const r = safeSkips(3, 4, 75)
    expect(r.count).toBe(0)
  })

  it('returns 0 when below target', () => {
    const r = safeSkips(1, 4, 75) // 25%
    expect(r.count).toBe(0)
  })

  it('is unlimited when target is 0%', () => {
    const r = safeSkips(0, 0, 0)
    expect(r.unlimited).toBe(true)
  })

  it('handles 100% target: 0 safe skips unless never missed', () => {
    expect(safeSkips(10, 10, 100).count).toBe(0)
    expect(safeSkips(9, 10, 100).count).toBe(0)
  })

  it('handles 0 total classes', () => {
    const r = safeSkips(0, 0, 75)
    expect(Number.isFinite(r.count)).toBe(true)
    expect(r.count).toBe(0)
  })
})

describe('recoveryNeeded', () => {
  it('computes classes needed to reach target', () => {
    // 34/50 = 68%, target 75%. (0.75*50-34)/(1-0.75) = (37.5-34)/0.25 = 14
    const r = recoveryNeeded(34, 50, 75)
    expect(r.reachable).toBe(true)
    expect(r.count).toBe(14)
  })

  it('returns 0 when already at or above target', () => {
    expect(recoveryNeeded(40, 50, 75).count).toBe(0)
    expect(recoveryNeeded(37.5, 50, 75).count).toBe(0) // exactly 75
  })

  it('handles 0 total classes', () => {
    const r = recoveryNeeded(0, 0, 75)
    expect(r.reachable).toBe(true)
    expect(r.count).toBe(0)
  })

  it('marks 100% target unreachable once a class has been missed', () => {
    const r = recoveryNeeded(9, 10, 100)
    expect(r.reachable).toBe(false)
  })

  it('100% target stays reachable with zero misses', () => {
    const r = recoveryNeeded(10, 10, 100)
    expect(r.reachable).toBe(true)
    expect(r.count).toBe(0)
  })

  it('never returns Infinity or NaN', () => {
    const r = recoveryNeeded(0, 10, 75)
    expect(Number.isFinite(r.count)).toBe(true)
  })
})

describe('forecastAttend / forecastSkip', () => {
  it('matches spec worked example: 40/50 skip vs attend', () => {
    expect(forecastSkip(40, 50, 1)).toBeCloseTo(78.43, 1)
    expect(forecastAttend(40, 50, 1)).toBeCloseTo(80.39, 1)
  })

  it('clamps negative n to 0', () => {
    expect(forecastAttend(40, 50, -5)).toBe(percentage(40, 50))
    expect(forecastSkip(40, 50, -5)).toBe(percentage(40, 50))
  })
})

describe('statusFor', () => {
  it('classifies safe/warning/danger', () => {
    expect(statusFor(85, 75)).toBe('safe')
    expect(statusFor(70, 75)).toBe('warning')
    expect(statusFor(50, 75)).toBe('danger')
  })
})

describe('subjectStats / overallStats', () => {
  const records = [
    { subjectId: 'ds', status: 'present' },
    { subjectId: 'ds', status: 'present' },
    { subjectId: 'ds', status: 'absent' },
    { subjectId: 'java', status: 'absent' },
    { subjectId: 'java', status: 'present' },
  ]

  it('aggregates per subject', () => {
    expect(subjectStats('ds', records)).toEqual({ attended: 2, missed: 1, total: 3, pct: percentage(2, 3) })
  })

  it('aggregates overall', () => {
    expect(overallStats(records)).toEqual({ attended: 3, missed: 2, total: 5, pct: percentage(3, 5) })
  })

  it('handles a subject with zero records', () => {
    expect(subjectStats('nonexistent', records)).toEqual({ attended: 0, missed: 0, total: 0, pct: 0 })
  })
})

describe('generateVacancies', () => {
  it('finds gaps between classes within 08:00-17:00', () => {
    const slots = [
      { start: '08:30', end: '09:30' },
      { start: '09:30', end: '10:30' },
      { start: '11:30', end: '12:30' },
    ]
    const gaps = generateVacancies(slots)
    expect(gaps).toEqual([
      { start: '08:00', end: '08:30' },
      { start: '10:30', end: '11:30' },
      { start: '12:30', end: '17:00' },
    ])
  })

  it('returns the full day as one vacancy when there are no classes', () => {
    expect(generateVacancies([])).toEqual([{ start: '08:00', end: '17:00' }])
  })

  it('returns no vacancies when the day is fully packed', () => {
    const slots = [{ start: '08:00', end: '17:00' }]
    expect(generateVacancies(slots)).toEqual([])
  })

  it('clips classes that start before 08:00 or end after 17:00', () => {
    const slots = [{ start: '07:00', end: '18:00' }]
    expect(generateVacancies(slots)).toEqual([])
  })
})

describe('durationMinutes', () => {
  it('computes duration', () => {
    expect(durationMinutes('08:30', '09:30')).toBe(60)
  })

  it('never goes negative', () => {
    expect(durationMinutes('10:00', '09:00')).toBe(0)
  })
})
