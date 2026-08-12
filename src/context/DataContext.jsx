import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { loadData, saveData } from '../data/storage'

const DataStateContext = createContext(null)
const DataDispatchContext = createContext(null)

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_SUBJECT': {
      const subject = {
        id: uid('sub'),
        name: action.name.trim(),
        target: action.target,
        color: action.color,
      }
      return { ...state, subjects: [...state.subjects, subject] }
    }

    case 'UPDATE_SUBJECT': {
      return {
        ...state,
        subjects: state.subjects.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)),
      }
    }

    case 'DELETE_SUBJECT': {
      // Cascades to timetable slots only. Historical records keep their
      // snapshotted subjectName/subjectId and are never touched.
      return {
        ...state,
        subjects: state.subjects.filter((s) => s.id !== action.id),
        timetable: state.timetable.filter((t) => t.subjectId !== action.id),
      }
    }

    case 'ADD_CLASS': {
      const slot = {
        id: uid('tt'),
        subjectId: action.subjectId,
        day: action.day,
        start: action.start,
        end: action.end,
        room: action.room ?? '',
      }
      return { ...state, timetable: [...state.timetable, slot] }
    }

    case 'UPDATE_CLASS': {
      return {
        ...state,
        timetable: state.timetable.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      }
    }

    case 'DELETE_CLASS': {
      // Historical attendance records reference this classId but are never
      // deleted — they simply become orphaned (still visible in History-style
      // views keyed by date, just no longer generated for future dates).
      return { ...state, timetable: state.timetable.filter((t) => t.id !== action.id) }
    }

    case 'MARK_ATTENDANCE': {
      const { date, classId, subjectId, subjectName, status } = action
      const dayRecords = state.records[date] ?? {}
      return {
        ...state,
        records: {
          ...state.records,
          [date]: {
            ...dayRecords,
            [classId]: { subjectId, subjectName, status, markedAt: new Date().toISOString() },
          },
        },
      }
    }

    case 'UNMARK_ATTENDANCE': {
      const { date, classId } = action
      const dayRecords = { ...(state.records[date] ?? {}) }
      delete dayRecords[classId]
      return { ...state, records: { ...state.records, [date]: dayRecords } }
    }

    case 'UPDATE_SETTINGS': {
      return { ...state, settings: { ...state.settings, ...action.patch } }
    }

    default:
      return state
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadData)

  useEffect(() => {
    saveData(state)
  }, [state])

  return (
    <DataStateContext.Provider value={state}>
      <DataDispatchContext.Provider value={dispatch}>{children}</DataDispatchContext.Provider>
    </DataStateContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataStateContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

export function useDataDispatch() {
  const ctx = useContext(DataDispatchContext)
  if (!ctx) throw new Error('useDataDispatch must be used within DataProvider')
  return ctx
}

/** Flattens the date-keyed records map into a flat list for the calc engine. */
export function useFlatRecords() {
  const { records } = useData()
  return useMemo(() => {
    const flat = []
    for (const date of Object.keys(records)) {
      for (const classId of Object.keys(records[date])) {
        flat.push({ date, classId, ...records[date][classId] })
      }
    }
    return flat
  }, [records])
}
