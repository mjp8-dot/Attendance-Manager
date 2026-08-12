import { useMemo, useState } from 'react'
import { useData, useDataDispatch } from '../context/DataContext.jsx'
import { dateKey, addDays } from '../utils/attendance'
import { dayTimeline, slotsForDay, WEEKDAY_LABELS, WEEKDAY_LABELS_FULL } from '../utils/schedule'
import { formatTime } from '../utils/format'
import SegmentedControl from '../components/SegmentedControl.jsx'
import ClassCard from '../components/ClassCard.jsx'
import VacancyCard from '../components/VacancyCard.jsx'
import './Schedule.css'

function nowHHMM() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function Schedule() {
  const { subjects, timetable, records, settings } = useData()
  const dispatch = useDataDispatch()
  const [view, setView] = useState('day')
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const todayStr = dateKey(new Date())
  const selectedKey = dateKey(selectedDate)
  const isToday = selectedKey === todayStr
  const weekday = selectedDate.getDay()
  const recordsForDate = records[selectedKey]

  const timeline = useMemo(
    () => dayTimeline(timetable, subjects, recordsForDate, weekday),
    [timetable, subjects, recordsForDate, weekday],
  )

  const current = isToday ? nowHHMM() : null

  function handleMark(slot, subject, action) {
    if (action === 'unmark') {
      dispatch({ type: 'UNMARK_ATTENDANCE', date: selectedKey, classId: slot.id })
    } else {
      dispatch({
        type: 'MARK_ATTENDANCE',
        date: selectedKey,
        classId: slot.id,
        subjectId: subject?.id,
        subjectName: subject?.name ?? 'Unknown',
        status: action,
      })
    }
  }

  function handleCancel(slot, subject) {
    dispatch({
      type: 'MARK_ATTENDANCE',
      date: selectedKey,
      classId: slot.id,
      subjectId: subject?.id,
      subjectName: subject?.name ?? 'Unknown',
      status: 'cancelled',
    })
  }

  function handleUncancel(slot) {
    dispatch({ type: 'UNMARK_ATTENDANCE', date: selectedKey, classId: slot.id })
  }

  const rows = useMemo(() => {
    const out = []
    let inserted = false
    for (const item of timeline) {
      if (current && !inserted && item.start >= current) {
        out.push({ kind: 'now' })
        inserted = true
      }
      out.push({ kind: 'item', item })
    }
    if (current && !inserted) out.push({ kind: 'now' })
    return out
  }, [timeline, current])

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-subtitle">08:00 – 17:00</span>
        <h1 className="page-title">Schedule</h1>
      </div>

      <SegmentedControl
        value={view}
        onChange={setView}
        options={[
          { value: 'day', label: 'DAY' },
          { value: 'week', label: 'WEEK' },
        ]}
      />

      {view === 'day' ? (
        <>
          <div className="date-nav">
            <button type="button" className="date-nav-btn" onClick={() => setSelectedDate((d) => addDays(d, -1))}>
              ←
            </button>
            <div className="date-nav-label">
              <div className="date-nav-day">{WEEKDAY_LABELS_FULL[weekday]}</div>
              <div className="date-nav-date">{selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
            </div>
            <button type="button" className="date-nav-btn" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
              →
            </button>
          </div>

          <div className="timeline">
            {timeline.length === 0 && <div className="card">No classes scheduled this day.</div>}
            {rows.map((row, idx) => {
              if (row.kind === 'now') {
                return (
                  <div key={`now-${idx}`} className="now-indicator">
                    NOW · {formatTime(current, settings.hour24)}
                  </div>
                )
              }
              const item = row.item
              const isNow = isToday && current >= item.start && current < item.end
              return item.type === 'vacancy' ? (
                <VacancyCard key={idx} start={item.start} end={item.end} isNow={isNow} />
              ) : (
                <ClassCard
                  key={idx}
                  slot={item.slot}
                  subject={item.subject}
                  status={item.status}
                  isNow={isNow}
                  onMark={(action) => handleMark(item.slot, item.subject, action)}
                  onCancel={item.status === 'unmarked' ? () => handleCancel(item.slot, item.subject) : undefined}
                  onUncancel={() => handleUncancel(item.slot)}
                />
              )
            })}
          </div>
        </>
      ) : (
        <div className="week-grid">
          {[1, 2, 3, 4, 5].map((day) => (
            <div key={day} className="card week-day-card">
              <div className="eyebrow">{WEEKDAY_LABELS[day]}</div>
              {slotsForDay(timetable, day).length === 0 ? (
                <div className="week-empty">Free day</div>
              ) : (
                <ul className="week-list">
                  {slotsForDay(timetable, day).map((slot) => {
                    const subject = subjects.find((s) => s.id === slot.subjectId)
                    return (
                      <li key={slot.id} className="week-row">
                        <span className="week-time">{formatTime(slot.start, settings.hour24)}</span>
                        <span className="week-name">{subject?.name ?? 'Unknown'}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
