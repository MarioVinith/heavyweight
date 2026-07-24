import { SEED_EXERCISES, SEED_TEMPLATE } from './seed'
import type { Workout } from './stats'
import { supabase } from './supabase'

export type Exercise = { id: string; name: string }

export type TemplateItem = {
  exercise_id: string
  label: string
  target_sets: number
  target_reps: string
}

export type Template = { id: string; name: string; items: TemplateItem[] }

export type AllData = {
  exercises: Exercise[]
  templates: Template[]
  workouts: Workout[]
}

function db() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function fetchAll(): Promise<AllData> {
  const [ex, tp, wo] = await Promise.all([
    db().from('exercises').select('id, name').order('name'),
    db().from('templates').select('id, name, items').order('name'),
    db().from('workouts').select('id, workout_date, entries').order('workout_date'),
  ])
  if (ex.error) throw ex.error
  if (tp.error) throw tp.error
  if (wo.error) throw wo.error
  return {
    exercises: (ex.data ?? []) as Exercise[],
    templates: (tp.data ?? []) as unknown as Template[],
    workouts: (wo.data ?? []) as unknown as Workout[],
  }
}

export async function createExercise(name: string): Promise<Exercise> {
  const { data, error } = await db()
    .from('exercises')
    .insert({ name: name.trim() })
    .select('id, name')
    .single()
  if (error) throw error
  return data as Exercise
}

export async function renameExercise(id: string, name: string): Promise<void> {
  const { error } = await db()
    .from('exercises')
    .update({ name: name.trim() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await db().from('exercises').delete().eq('id', id)
  if (error) throw error
}

export async function saveTemplate(t: {
  id?: string
  name: string
  items: TemplateItem[]
}): Promise<Template> {
  const row = { name: t.name.trim(), items: t.items }
  const query = t.id
    ? db().from('templates').update(row).eq('id', t.id)
    : db().from('templates').insert(row)
  const { data, error } = await query.select('id, name, items').single()
  if (error) throw error
  return data as unknown as Template
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await db().from('templates').delete().eq('id', id)
  if (error) throw error
}

/** Upsert by (user_id, workout_date): one row per calendar day. */
export async function saveWorkout(w: Workout): Promise<Workout> {
  const { data, error } = await db()
    .from('workouts')
    .upsert(
      { workout_date: w.workout_date, entries: w.entries },
      { onConflict: 'user_id,workout_date' },
    )
    .select('id, workout_date, entries')
    .single()
  if (error) throw error
  return data as unknown as Workout
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await db().from('workouts').delete().eq('id', id)
  if (error) throw error
}

/**
 * First-login bootstrap: when the library is empty, create the 8 canonical
 * exercises and the "Upper 2 – Block 1" template from the trainer screenshots.
 * Returns true when it seeded. Idempotent under unique constraints.
 */
export async function seedIfEmpty(): Promise<boolean> {
  const { count, error } = await db()
    .from('exercises')
    .select('id', { count: 'exact', head: true })
  if (error) throw error
  if ((count ?? 0) > 0) return false

  const { data: inserted, error: exError } = await db()
    .from('exercises')
    .upsert(
      SEED_EXERCISES.map((name) => ({ name })),
      { onConflict: 'user_id,name', ignoreDuplicates: true },
    )
    .select('id, name')
  if (exError) throw exError

  const idByName = new Map((inserted ?? []).map((e) => [e.name, e.id]))
  const items = SEED_TEMPLATE.items.flatMap((item) => {
    const exercise_id = idByName.get(item.exercise_name)
    if (!exercise_id) return []
    return [{
      exercise_id,
      label: item.label,
      target_sets: item.target_sets,
      target_reps: item.target_reps,
    }]
  })

  const { error: tpError } = await db()
    .from('templates')
    .upsert(
      [{ name: SEED_TEMPLATE.name, items }],
      { onConflict: 'user_id,name', ignoreDuplicates: true },
    )
  if (tpError) throw tpError
  return true
}
