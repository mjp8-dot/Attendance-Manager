import { useState } from 'react'
import { useData, useDataDispatch } from '../context/DataContext.jsx'
import { WEEKDAY_LABELS_FULL } from '../utils/schedule'
import { formatTime } from '../utils/format'
import { SUBJECT_COLORS } from '../data/seed'
import Modal from '../components/Modal.jsx'
import { PlusIcon, TrashIcon } from '../components/icons.jsx'
import './Edit.css'

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]

function SubjectForm({ initial, subjects, onSave, onClose }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [target, setTarget] = useState(initial?.target ?? 75)
  const [color, setColor] = useState(initial?.color ?? 'cyan')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Subject name is required.')
    const dup = subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase() && s.id !== initial?.id)
    if (dup) return setError('A subject with that name already exists.')
    const t = Number(target)
    if (Number.isNaN(t) || t < 0 || t > 100) return setError('Target must be between 0 and 100.')
    onSave({ name: trimmed, target: t, color })
    onClose()
  }

  return (
    <form className="edit-form" onSubmit={submit}>
      <div className="field">
        <label className="field-label" htmlFor="subject-name">
          Subject name
        </label>
        <input id="subject-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Data Structures" />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="subject-target">
          Attendance target (%)
        </label>
        <input id="subject-target" type="number" min="0" max="100" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>
      <div className="field">
        <span className="field-label">Color</span>
        <div className="color-picker">
          {SUBJECT_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              className={`color-swatch color-swatch--${c}${color === c ? ' color-swatch--active' : ''}`}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
        </div>
      </div>
      {error && <div className="field-error">{error}</div>}
      <button type="submit" className="btn-primary">
        Save subject
      </button>
    </form>
  )
}

function ClassForm({ initial, subjects, onSave, onClose }) {
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? subjects[0]?.id ?? '')
  const [day, setDay] = useState(initial?.day ?? 1)
  const [start, setStart] = useState(initial?.start ?? '08:30')
  const [end, setEnd] = useState(initial?.end ?? '09:30')
  const [room, setRoom] = useState(initial?.room ?? '')
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!subjectId) return setError('Pick a subject.')
    if (start >= end) return setError('End time must be after start time.')
    if (start < '08:00' || end > '17:00') return setError('Classes must fall within 08:00–17:00.')
    onSave({ subjectId, day: Number(day), start, end, room: room.trim() })
    onClose()
  }

  return (
    <form className="edit-form" onSubmit={submit}>
      <div className="field">
        <label className="field-label" htmlFor="class-subject">
          Subject
        </label>
        <select id="class-subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field-label" htmlFor="class-day">
          Day
        </label>
        <select id="class-day" value={day} onChange={(e) => setDay(e.target.value)}>
          {WEEKDAYS.map((d) => (
            <option key={d} value={d}>
              {WEEKDAY_LABELS_FULL[d]}
            </option>
          ))}
        </select>
      </div>
      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="class-start">
            Start
          </label>
          <input id="class-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="class-end">
            End
          </label>
          <input id="class-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label className="field-label" htmlFor="class-room">
          Room (optional)
        </label>
        <input id="class-room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 302" />
      </div>
      {error && <div className="field-error">{error}</div>}
      <button type="submit" className="btn-primary">
        Save class
      </button>
    </form>
  )
}

export default function Edit() {
  const { subjects, timetable, settings } = useData()
  const dispatch = useDataDispatch()
  const [subjectModal, setSubjectModal] = useState(null) // null | 'new' | subject object
  const [classModal, setClassModal] = useState(null)

  function saveSubject(patch) {
    if (subjectModal && subjectModal !== 'new') {
      dispatch({ type: 'UPDATE_SUBJECT', id: subjectModal.id, patch })
    } else {
      dispatch({ type: 'ADD_SUBJECT', ...patch })
    }
  }

  function deleteSubject(id) {
    if (!confirm('Delete this subject? Its timetable slots will be removed too. Past attendance history is kept.')) return
    dispatch({ type: 'DELETE_SUBJECT', id })
  }

  function saveClass(patch) {
    if (classModal && classModal !== 'new') {
      dispatch({ type: 'UPDATE_CLASS', id: classModal.id, patch })
    } else {
      dispatch({ type: 'ADD_CLASS', ...patch })
    }
  }

  function deleteClass(id) {
    if (!confirm('Delete this class from the timetable? Past attendance history is kept.')) return
    dispatch({ type: 'DELETE_CLASS', id })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Edit</h1>
        <span className="page-subtitle">Manage subjects and timetable</span>
      </div>

      <div className="desktop-grid">
        <div className="section">
          <div className="section-title">Subjects</div>
          <div className="card list-card-group">
            {subjects.length === 0 && <div className="list-card">No subjects yet.</div>}
            {subjects.map((s) => (
              <div key={s.id} className="list-card">
                <div>
                  <div className="list-card-title">{s.name}</div>
                  <div className="list-card-sub">{s.target}% target</div>
                </div>
                <div className="list-card-actions">
                  <button type="button" className="btn-secondary" onClick={() => setSubjectModal(s)}>
                    Edit
                  </button>
                  <button type="button" className="icon-btn" onClick={() => deleteSubject(s.id)} aria-label="Delete subject">
                    <TrashIcon width={16} height={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="fab" onClick={() => setSubjectModal('new')}>
            <PlusIcon width={16} height={16} /> Add subject
          </button>
        </div>

        <div className="section">
          <div className="section-title">Timetable</div>
          <div className="card list-card-group">
            {timetable.length === 0 && <div className="list-card">No classes scheduled yet.</div>}
            {timetable
              .slice()
              .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start))
              .map((slot) => {
                const subject = subjects.find((s) => s.id === slot.subjectId)
                return (
                  <div key={slot.id} className="list-card">
                    <div>
                      <div className="list-card-title">{subject?.name ?? 'Unknown subject'}</div>
                      <div className="list-card-sub">
                        {WEEKDAY_LABELS_FULL[slot.day]} · {formatTime(slot.start, settings.hour24)}–
                        {formatTime(slot.end, settings.hour24)}
                        {slot.room && ` · Room ${slot.room}`}
                      </div>
                    </div>
                    <div className="list-card-actions">
                      <button type="button" className="btn-secondary" onClick={() => setClassModal(slot)}>
                        Edit
                      </button>
                      <button type="button" className="icon-btn" onClick={() => deleteClass(slot.id)} aria-label="Delete class">
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
          <button
            type="button"
            className="fab"
            disabled={subjects.length === 0}
            onClick={() => setClassModal('new')}
          >
            <PlusIcon width={16} height={16} /> Add class
          </button>
          {subjects.length === 0 && <div className="field-error">Add a subject first.</div>}
        </div>
      </div>

      {subjectModal && (
        <Modal title={subjectModal === 'new' ? 'Add subject' : 'Edit subject'} onClose={() => setSubjectModal(null)}>
          <SubjectForm
            initial={subjectModal === 'new' ? null : subjectModal}
            subjects={subjects}
            onSave={saveSubject}
            onClose={() => setSubjectModal(null)}
          />
        </Modal>
      )}

      {classModal && (
        <Modal title={classModal === 'new' ? 'Add class' : 'Edit class'} onClose={() => setClassModal(null)}>
          <ClassForm
            initial={classModal === 'new' ? null : classModal}
            subjects={subjects}
            onSave={saveClass}
            onClose={() => setClassModal(null)}
          />
        </Modal>
      )}
    </div>
  )
}
