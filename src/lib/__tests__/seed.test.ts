import { describe, expect, it } from 'vitest'
import { SEED_EXERCISES, SEED_TEMPLATE } from '../seed'

describe('seed data (from trainer-app screenshots)', () => {
  it('has 8 unique canonical exercise names', () => {
    expect(SEED_EXERCISES).toHaveLength(8)
    expect(new Set(SEED_EXERCISES).size).toBe(8)
  })

  it('template covers all 8 with trainer labels in order', () => {
    expect(SEED_TEMPLATE.name).toBe('Upper 2 – Block 1')
    expect(SEED_TEMPLATE.items.map((i) => i.label)).toEqual([
      'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2',
    ])
  })

  it('every template item references a seeded exercise name', () => {
    for (const item of SEED_TEMPLATE.items) {
      expect(SEED_EXERCISES).toContain(item.exercise_name)
    }
  })

  it('matches the screenshot set/rep prescriptions', () => {
    expect(SEED_TEMPLATE.items.map((i) => i.target_sets)).toEqual([
      3, 3, 3, 3, 3, 3, 2, 2,
    ])
    expect(SEED_TEMPLATE.items.map((i) => i.target_reps)).toEqual([
      '8-10', '8-10', '8-10', '5-8', '10-12', '10-12', '12-15', '12-15',
    ])
  })
})
