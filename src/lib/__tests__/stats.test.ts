import { describe, expect, it } from 'vitest'
import type { Workout } from '../stats'
import {
  exerciseHistory,
  lastEntryFor,
  prState,
  topSetWeight,
  totalVolume,
} from '../stats'

const pyramid = [
  { weight: 5, reps: 10 },
  { weight: 8, reps: 10 },
  { weight: 10, reps: 12 },
]

describe('topSetWeight', () => {
  it('returns the heaviest set of an ascending pyramid', () => {
    expect(topSetWeight(pyramid)).toBe(10)
  })
  it('returns 0 for no sets', () => {
    expect(topSetWeight([])).toBe(0)
  })
  it('ignores zero-weight placeholder sets', () => {
    expect(topSetWeight([{ weight: 0, reps: 10 }])).toBe(0)
  })
})

describe('totalVolume', () => {
  it('sums weight x reps across sets', () => {
    expect(totalVolume(pyramid)).toBe(5 * 10 + 8 * 10 + 10 * 12) // 250
  })
  it('returns 0 for no sets', () => {
    expect(totalVolume([])).toBe(0)
  })
})

const A = 'ex-a'
const B = 'ex-b'

// Deliberately unsorted; 07-10 has an empty entry that must be skipped.
const ws: Workout[] = [
  {
    workout_date: '2026-07-17',
    entries: [
      { exercise_id: A, sets: [{ weight: 8, reps: 10 }, { weight: 10, reps: 10 }] },
    ],
  },
  {
    workout_date: '2026-07-03',
    entries: [
      { exercise_id: A, sets: [{ weight: 5, reps: 10 }, { weight: 8, reps: 12 }] },
      { exercise_id: B, sets: [{ weight: 20, reps: 8 }] },
    ],
  },
  { workout_date: '2026-07-10', entries: [{ exercise_id: A, sets: [] }] },
]

describe('exerciseHistory', () => {
  it('returns date-ascending points for one exercise, skipping empty entries', () => {
    expect(exerciseHistory(ws, A)).toEqual([
      { date: '2026-07-03', top: 8, volume: 5 * 10 + 8 * 12 },
      { date: '2026-07-17', top: 10, volume: 8 * 10 + 10 * 10 },
    ])
  })
  it('filters to the requested exercise only', () => {
    expect(exerciseHistory(ws, B)).toEqual([
      { date: '2026-07-03', top: 20, volume: 160 },
    ])
  })
  it('returns [] for an unknown exercise', () => {
    expect(exerciseHistory(ws, 'nope')).toEqual([])
  })
})

describe('lastEntryFor', () => {
  it('finds the most recent entry strictly before the date', () => {
    expect(lastEntryFor(ws, A, '2026-07-24')?.date).toBe('2026-07-17')
    expect(lastEntryFor(ws, A, '2026-07-17')?.date).toBe('2026-07-03')
  })
  it('skips empty entries', () => {
    expect(lastEntryFor(ws, A, '2026-07-12')?.date).toBe('2026-07-03')
  })
  it('returns null when there is no earlier history', () => {
    expect(lastEntryFor(ws, B, '2026-07-03')).toBeNull()
  })
})

describe('prState', () => {
  it('flags top-set and volume PRs when strictly beating all earlier sessions', () => {
    expect(prState(ws, A, '2026-07-17')).toEqual({ topPR: true, volumePR: true })
  })
  it('does not call the first session a PR', () => {
    expect(prState(ws, A, '2026-07-03')).toEqual({ topPR: false, volumePR: false })
  })
  it('does not count ties as PRs', () => {
    const tied: Workout[] = [
      ...ws,
      {
        workout_date: '2026-07-24',
        entries: [
          { exercise_id: A, sets: [{ weight: 10, reps: 8 }] }, // top ties 10, volume 80 < 180
        ],
      },
    ]
    expect(prState(tied, A, '2026-07-24')).toEqual({ topPR: false, volumePR: false })
  })
})
