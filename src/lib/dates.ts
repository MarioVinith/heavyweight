// All dates in the app are local-time 'YYYY-MM-DD' strings.

export type YearMonth = { y: number; m: number } // m is 1-12

function toISO(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return toISO(new Date())
}

export function addMonths(ym: YearMonth, delta: number): YearMonth {
  const zeroBased = ym.y * 12 + (ym.m - 1) + delta
  return { y: Math.floor(zeroBased / 12), m: ((zeroBased % 12) + 12) % 12 + 1 }
}

/** 42 cells (6 weeks), Monday-first; null = padding outside the month. */
export function monthGrid(y: number, m: number): (string | null)[] {
  const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7 // Sun=0 -> Mon-first offset
  const daysInMonth = new Date(y, m, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < 42; i++) {
    const day = i - lead + 1
    cells.push(day >= 1 && day <= daysInMonth ? toISO(new Date(y, m - 1, day)) : null)
  }
  return cells
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 'YYYY-MM-DD' -> 'Fri 17 Jul' (locale-independent) */
export function formatDay(iso: string): string {
  const d = parseISO(iso)
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}
