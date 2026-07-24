import { describe, expect, it } from 'vitest'
import { addMonths, formatDay, monthGrid, todayISO } from '../dates'

describe('todayISO', () => {
  it('returns a local YYYY-MM-DD string', () => {
    const iso = todayISO()
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const now = new Date()
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    expect(iso).toBe(expected)
  })
})

describe('addMonths', () => {
  it('moves within a year', () => {
    expect(addMonths({ y: 2026, m: 7 }, -1)).toEqual({ y: 2026, m: 6 })
    expect(addMonths({ y: 2026, m: 7 }, 1)).toEqual({ y: 2026, m: 8 })
  })
  it('wraps across year boundaries', () => {
    expect(addMonths({ y: 2026, m: 1 }, -1)).toEqual({ y: 2025, m: 12 })
    expect(addMonths({ y: 2026, m: 12 }, 1)).toEqual({ y: 2027, m: 1 })
  })
  it('handles zero delta', () => {
    expect(addMonths({ y: 2026, m: 7 }, 0)).toEqual({ y: 2026, m: 7 })
  })
})

describe('monthGrid', () => {
  it('lays out July 2026 Monday-first (July 1st is a Wednesday)', () => {
    const grid = monthGrid(2026, 7)
    expect(grid).toHaveLength(42)
    expect(grid[0]).toBeNull()
    expect(grid[1]).toBeNull()
    expect(grid[2]).toBe('2026-07-01')
    expect(grid[32]).toBe('2026-07-31')
    expect(grid[33]).toBeNull()
    expect(grid[41]).toBeNull()
  })
  it('starts at cell 0 when the 1st is a Monday (June 2026)', () => {
    const grid = monthGrid(2026, 6)
    expect(grid[0]).toBe('2026-06-01')
    expect(grid[29]).toBe('2026-06-30')
    expect(grid[30]).toBeNull()
  })
})

describe('formatDay', () => {
  it('formats as "Ddd D Mmm" without leading zero', () => {
    expect(formatDay('2026-07-17')).toBe('Fri 17 Jul')
    expect(formatDay('2026-07-03')).toBe('Fri 3 Jul')
  })
})
