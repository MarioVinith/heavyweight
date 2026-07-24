import type { SetEntry } from '../lib/stats'

type Props = {
  index: number
  set: SetEntry
  onChange: (patch: Partial<SetEntry>) => void
  onRemove: () => void
}

export default function SetRow({ index, set, onChange, onRemove }: Props) {
  return (
    <div className="set-row">
      <span className="label set-num">SET {index + 1}</span>
      <input
        className="input set-input"
        type="number"
        inputMode="decimal"
        step="0.5"
        min="0"
        placeholder="kg"
        value={set.weight || ''}
        onChange={(e) => onChange({ weight: Number(e.target.value) || 0 })}
      />
      <input
        className="input set-input"
        type="number"
        inputMode="numeric"
        step="1"
        min="0"
        placeholder="reps"
        value={set.reps || ''}
        onChange={(e) => onChange({ reps: Math.floor(Number(e.target.value)) || 0 })}
      />
      <button
        className="icon-btn"
        aria-label={`Remove set ${index + 1}`}
        onClick={onRemove}
      >
        ✕
      </button>
    </div>
  )
}
