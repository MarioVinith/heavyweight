import { useMemo, useState } from 'react'
import type { Template, TemplateItem } from '../lib/api'
import { useStore } from '../store/Store'

type Draft = { id?: string; name: string; items: TemplateItem[] }

export default function Setup() {
  const store = useStore()
  const { exercises, templates, workouts, session, exerciseName } = store
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)

  const sessionCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const w of workouts) {
      for (const e of w.entries) {
        counts.set(e.exercise_id, (counts.get(e.exercise_id) ?? 0) + 1)
      }
    }
    return counts
  }, [workouts])

  async function onAddExercise() {
    const name = window.prompt('New exercise name (canonical — pick once, use forever):')
    if (!name?.trim()) return
    await store.addExercise(name)
  }

  async function onRename(id: string, current: string) {
    const name = window.prompt('Rename exercise (all history follows it):', current)
    if (!name?.trim() || name.trim() === current) return
    await store.renameExercise(id, name)
  }

  async function onDeleteExercise(id: string) {
    if (!window.confirm(`Delete “${exerciseName(id)}” from your library?`)) return
    const err = await store.removeExercise(id)
    if (err) window.alert(err)
  }

  async function onDeleteTemplate(t: Template) {
    if (!window.confirm(`Delete template “${t.name}”? Logged days keep their data.`)) return
    await store.removeTemplate(t.id)
  }

  function mutateDraft(fn: (d: Draft) => void) {
    setDraft((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      fn(next)
      return next
    })
  }

  async function saveDraft() {
    if (!draft) return
    if (!draft.name.trim() || draft.items.length === 0) {
      window.alert('A template needs a name and at least one exercise.')
      return
    }
    setBusy(true)
    try {
      await store.saveTemplate(draft)
      setDraft(null)
    } catch {
      window.alert('Could not save the template — are you online?')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1 className="display h1">
        GYM <span className="gold">SETUP</span>
      </h1>

      {/* ---------- exercise library ---------- */}
      <h2 className="display setup-sub">EXERCISE LIBRARY</h2>
      <div className="card pr-wall">
        {exercises.map((e) => (
          <div key={e.id} className="lib-row">
            <div className="lib-main">
              <span className="lib-name">{e.name}</span>
              <span className="label">
                {sessionCounts.get(e.id) ?? 0} SESSIONS
              </span>
            </div>
            <button
              className="icon-btn"
              aria-label={`Rename ${e.name}`}
              onClick={() => void onRename(e.id, e.name)}
            >
              ✎
            </button>
            <button
              className="icon-btn"
              aria-label={`Delete ${e.name}`}
              onClick={() => void onDeleteExercise(e.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn-ghost btn-block setup-add" onClick={() => void onAddExercise()}>
        + ADD TO LIBRARY
      </button>

      {/* ---------- templates ---------- */}
      <h2 className="display setup-sub">DAY TEMPLATES</h2>

      {draft === null ? (
        <>
          <div className="card pr-wall">
            {templates.length === 0 && (
              <p className="muted tpl-empty">No templates yet.</p>
            )}
            {templates.map((t) => (
              <div key={t.id} className="lib-row">
                <div className="lib-main">
                  <span className="lib-name">{t.name}</span>
                  <span className="label">{t.items.length} EXERCISES</span>
                </div>
                <button
                  className="icon-btn"
                  aria-label={`Edit ${t.name}`}
                  onClick={() => setDraft(structuredClone(t))}
                >
                  ✎
                </button>
                <button
                  className="icon-btn"
                  aria-label={`Delete ${t.name}`}
                  onClick={() => void onDeleteTemplate(t)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            className="btn btn-ghost btn-block setup-add"
            onClick={() => setDraft({ name: '', items: [] })}
          >
            + NEW TEMPLATE
          </button>
        </>
      ) : (
        <div className="card tpl-editor">
          <input
            className="input"
            placeholder="Template name (e.g. Upper 2 – Block 1)"
            value={draft.name}
            onChange={(e) => mutateDraft((d) => (d.name = e.target.value))}
          />

          {draft.items.map((item, i) => (
            <div key={i} className="tpl-item">
              <div className="tpl-item-row">
                <input
                  className="input tpl-label"
                  placeholder="A1"
                  value={item.label}
                  onChange={(e) => mutateDraft((d) => (d.items[i].label = e.target.value))}
                />
                <select
                  className="input"
                  value={item.exercise_id}
                  onChange={(e) =>
                    mutateDraft((d) => (d.items[i].exercise_id = e.target.value))
                  }
                >
                  {exercises.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
                <button
                  className="icon-btn"
                  aria-label="Remove exercise from template"
                  onClick={() => mutateDraft((d) => void d.items.splice(i, 1))}
                >
                  ✕
                </button>
              </div>
              <div className="tpl-item-row">
                <div className="stepper">
                  <button
                    className="btn btn-ghost btn-small"
                    onClick={() =>
                      mutateDraft(
                        (d) => (d.items[i].target_sets = Math.max(1, item.target_sets - 1)),
                      )
                    }
                  >
                    −
                  </button>
                  <span className="label">{item.target_sets} SETS</span>
                  <button
                    className="btn btn-ghost btn-small"
                    onClick={() =>
                      mutateDraft((d) => (d.items[i].target_sets = item.target_sets + 1))
                    }
                  >
                    +
                  </button>
                </div>
                <input
                  className="input tpl-reps"
                  placeholder="8-10 reps"
                  value={item.target_reps}
                  onChange={(e) =>
                    mutateDraft((d) => (d.items[i].target_reps = e.target.value))
                  }
                />
                <button
                  className="icon-btn"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() =>
                    mutateDraft((d) => {
                      ;[d.items[i - 1], d.items[i]] = [d.items[i], d.items[i - 1]]
                    })
                  }
                >
                  ↑
                </button>
                <button
                  className="icon-btn"
                  aria-label="Move down"
                  disabled={i === draft.items.length - 1}
                  onClick={() =>
                    mutateDraft((d) => {
                      ;[d.items[i], d.items[i + 1]] = [d.items[i + 1], d.items[i]]
                    })
                  }
                >
                  ↓
                </button>
              </div>
            </div>
          ))}

          {exercises.length > 0 && (
            <button
              className="btn btn-ghost btn-block btn-small"
              onClick={() =>
                mutateDraft((d) =>
                  d.items.push({
                    exercise_id: exercises[0].id,
                    label: '',
                    target_sets: 3,
                    target_reps: '8-10',
                  }),
                )
              }
            >
              + ADD EXERCISE
            </button>
          )}

          <div className="tpl-actions">
            <button className="btn btn-ghost" onClick={() => setDraft(null)}>
              CANCEL
            </button>
            <button className="btn btn-gold" disabled={busy} onClick={() => void saveDraft()}>
              {busy ? 'SAVING…' : 'SAVE TEMPLATE'}
            </button>
          </div>
        </div>
      )}

      {/* ---------- account ---------- */}
      <hr className="divider" />
      <button className="btn btn-red btn-block" onClick={() => void store.signOut()}>
        SIGN OUT
      </button>
      <p className="label setup-email">{session?.user?.email ?? ''}</p>
    </div>
  )
}
