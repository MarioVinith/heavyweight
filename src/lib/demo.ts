// Dev-only demo dataset (VITE_DEMO=1): 8 weeks of steady progress so every
// screen can be built and eyeballed without a real backend.

import type { AllData, Exercise, Template } from './api'
import { todayISO, parseISO } from './dates'
import { SEED_EXERCISES, SEED_TEMPLATE } from './seed'
import type { Workout } from './stats'

function isoDaysAgo(days: number): string {
  const d = parseISO(todayISO())
  d.setDate(d.getDate() - days)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function demoData(): AllData {
  const exercises: Exercise[] = SEED_EXERCISES.map((name, i) => ({
    id: `demo-ex-${i}`,
    name,
  }))
  const idByName = new Map(exercises.map((e) => [e.name, e.id]))

  const template: Template = {
    id: 'demo-tp-1',
    name: SEED_TEMPLATE.name,
    items: SEED_TEMPLATE.items.map((item) => ({
      exercise_id: idByName.get(item.exercise_name)!,
      label: item.label,
      target_sets: item.target_sets,
      target_reps: item.target_reps,
    })),
  }

  // One session per week for 8 weeks, weights creeping up ~0.5kg a week.
  const workouts: Workout[] = []
  for (let week = 7; week >= 0; week--) {
    const progress = (7 - week) * 0.5
    workouts.push({
      id: `demo-w-${week}`,
      workout_date: isoDaysAgo(week * 7),
      entries: template.items.map((item, idx) => ({
        exercise_id: item.exercise_id,
        label: item.label,
        target_reps: item.target_reps,
        sets: Array.from({ length: item.target_sets }, (_, s) => ({
          weight: 5 + idx * 2 + s * 2.5 + progress,
          reps: 10,
        })),
      })),
    })
  }

  return { exercises, templates: [template], workouts }
}
