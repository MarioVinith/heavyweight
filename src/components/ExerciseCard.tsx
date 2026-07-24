import { formatDay } from '../lib/dates'
import type { SetEntry, WorkoutEntry } from '../lib/stats'
import SetRow from './SetRow'

type Props = {
  name: string
  entry: WorkoutEntry
  last: { date: string; sets: SetEntry[] } | null
  onUpdateSet: (setIndex: number, patch: Partial<SetEntry>) => void
  onAddSet: () => void
  onRemoveSet: (setIndex: number) => void
  onRemove: () => void
}

export default function ExerciseCard({
  name,
  entry,
  last,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onRemove,
}: Props) {
  return (
    <div className="card ex-card">
      <div className="ex-head">
        {entry.label && <span className="chip chip-gold">{entry.label}</span>}
        <span className="ex-name">{name}</span>
        <button
          className="icon-btn"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
        >
          ✕
        </button>
      </div>

      <div className="ex-hints">
        {entry.target_reps && <span className="chip">×{entry.target_reps} reps</span>}
        {last ? (
          <span className="last-hint">
            LAST · {formatDay(last.date)}:{' '}
            <strong className="gold">
              {last.sets.map((s) => s.weight).join(' / ')} kg
            </strong>
          </span>
        ) : (
          <span className="last-hint">FIRST TIME — SET THE BASELINE</span>
        )}
      </div>

      <div className="set-list">
        {entry.sets.map((set, i) => (
          <SetRow
            key={i}
            index={i}
            set={set}
            onChange={(patch) => onUpdateSet(i, patch)}
            onRemove={() => onRemoveSet(i)}
          />
        ))}
      </div>

      <button className="btn btn-ghost btn-small" onClick={onAddSet}>
        + ADD SET
      </button>
    </div>
  )
}
