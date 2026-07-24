import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ExerciseCard from '../components/ExerciseCard'
import Toast from '../components/Toast'
import type { Template } from '../lib/api'
import { formatDay } from '../lib/dates'
import {
  lastEntryFor,
  prState,
  type SetEntry,
  type Workout,
  type WorkoutEntry,
} from '../lib/stats'
import { useStore } from '../store/Store'

const NEW_EXERCISE = '__new__'

function blankSets(count: number): SetEntry[] {
  return Array.from({ length: count }, () => ({ weight: 0, reps: 0 }))
}

export default function Day() {
  const { date = '' } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const {
    workouts,
    templates,
    exercises,
    exerciseName,
    addExercise,
    saveWorkout,
    removeWorkout,
  } = useStore()

  const existing = useMemo(
    () => workouts.find((w) => w.workout_date === date),
    [workouts, date],
  )

  const [entries, setEntries] = useState<WorkoutEntry[]>(() =>
    structuredClone(existing?.entries ?? []),
  )
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; gold: boolean } | null>(null)

  function mutate(fn: (prev: WorkoutEntry[]) => WorkoutEntry[]) {
    setEntries((prev) => fn(structuredClone(prev)))
    setDirty(true)
  }

  function applyTemplate(t: Template) {
    mutate((prev) => [
      ...prev,
      ...t.items.map((item) => ({
        exercise_id: item.exercise_id,
        label: item.label,
        target_reps: item.target_reps,
        sets: blankSets(item.target_sets),
      })),
    ])
  }

  async function onAddExercise(value: string) {
    if (!value) return
    let exerciseId = value
    if (value === NEW_EXERCISE) {
      const name = window.prompt('Name the new exercise (it joins your library):')
      if (!name?.trim()) return
      try {
        exerciseId = (await addExercise(name)).id
      } catch {
        setToast({ message: 'COULD NOT ADD EXERCISE — ARE YOU ONLINE?', gold: false })
        return
      }
    }
    mutate((prev) => [...prev, { exercise_id: exerciseId, sets: blankSets(3) }])
  }

  async function onSave() {
    const cleaned = entries
      .map((e) => ({ ...e, sets: e.sets.filter((s) => s.weight > 0 || s.reps > 0) }))
      .filter((e) => e.sets.length > 0)

    setSaving(true)
    try {
      if (cleaned.length === 0) {
        if (existing?.id) await removeWorkout(existing.id)
        navigate('/')
        return
      }

      const candidate: Workout = { id: existing?.id, workout_date: date, entries: cleaned }
      const withCandidate = [
        ...workouts.filter((w) => w.workout_date !== date),
        candidate,
      ]
      const prNames = cleaned
        .filter((e) => prState(withCandidate, e.exercise_id, date).topPR)
        .map((e) => exerciseName(e.exercise_id))

      await saveWorkout(candidate)
      setEntries(cleaned)
      setDirty(false)
      setToast(
        prNames.length > 0
          ? { message: `🥊 NEW PR — ${prNames.join(', ').toUpperCase()}`, gold: true }
          : { message: 'SAVED. GOOD WORK.', gold: false },
      )
    } catch {
      setToast({ message: 'SAVE FAILED — CHECK YOUR CONNECTION', gold: false })
    } finally {
      setSaving(false)
    }
  }

  async function onDeleteDay() {
    if (!existing?.id) return
    if (!window.confirm('Delete everything logged on this day?')) return
    await removeWorkout(existing.id)
    navigate('/')
  }

  const usedIds = new Set(entries.map((e) => e.exercise_id))
  const addable = exercises.filter((e) => !usedIds.has(e.id))

  return (
    <div>
      <div className="day-head">
        <button
          className="btn btn-ghost cal-nav"
          aria-label="Back to calendar"
          onClick={() => navigate('/')}
        >
          ‹
        </button>
        <h1 className="display day-title">{formatDay(date)}</h1>
        {existing?.id && (
          <button className="icon-btn" aria-label="Delete this day" onClick={onDeleteDay}>
            🗑
          </button>
        )}
      </div>

      {entries.length === 0 && (
        <div className="day-empty">
          <p className="display day-empty-title">
            RING'S <span className="red">EMPTY</span>
          </p>
          <p className="muted">Apply a template or add an exercise to start the round.</p>
          {templates.map((t) => (
            <button
              key={t.id}
              className="btn btn-gold btn-block"
              onClick={() => applyTemplate(t)}
            >
              APPLY “{t.name.toUpperCase()}”
            </button>
          ))}
        </div>
      )}

      <div className="ex-list">
        {entries.map((entry, i) => (
          <ExerciseCard
            key={`${entry.exercise_id}-${i}`}
            name={exerciseName(entry.exercise_id)}
            entry={entry}
            last={lastEntryFor(workouts, entry.exercise_id, date)}
            onUpdateSet={(setIdx, patch) =>
              mutate((prev) => {
                Object.assign(prev[i].sets[setIdx], patch)
                return prev
              })
            }
            onAddSet={() =>
              mutate((prev) => {
                prev[i].sets.push({ weight: 0, reps: 0 })
                return prev
              })
            }
            onRemoveSet={(setIdx) =>
              mutate((prev) => {
                prev[i].sets.splice(setIdx, 1)
                return prev
              })
            }
            onRemove={() =>
              mutate((prev) => prev.filter((_, idx) => idx !== i))
            }
          />
        ))}
      </div>

      <select
        className="input add-ex"
        value=""
        onChange={(e) => void onAddExercise(e.target.value)}
      >
        <option value="">+ ADD EXERCISE…</option>
        {addable.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
        <option value={NEW_EXERCISE}>➕ New exercise…</option>
      </select>

      {dirty && (
        <div className="save-bar">
          <button
            className="btn btn-gold btn-block save-btn"
            disabled={saving}
            onClick={() => void onSave()}
          >
            {saving ? 'SAVING…' : 'SAVE THE ROUND'}
          </button>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          gold={toast.gold}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  )
}
