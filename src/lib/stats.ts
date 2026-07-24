export type SetEntry = { weight: number; reps: number }

export type WorkoutEntry = {
  exercise_id: string
  label?: string
  target_reps?: string
  sets: SetEntry[]
}

export type Workout = {
  id?: string
  workout_date: string
  entries: WorkoutEntry[]
}

export type HistoryPoint = { date: string; top: number; volume: number }

/** Heaviest weight across sets; 0 when there is no meaningful set. */
export function topSetWeight(sets: SetEntry[]): number {
  return sets.reduce((max, s) => (s.weight > max ? s.weight : max), 0)
}

/** Total work: sum of weight x reps across sets. */
export function totalVolume(sets: SetEntry[]): number {
  return sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
}

function setsFor(w: Workout, exerciseId: string): SetEntry[] {
  return w.entries
    .filter((e) => e.exercise_id === exerciseId)
    .flatMap((e) => e.sets)
}

function isMeaningful(sets: SetEntry[]): boolean {
  return topSetWeight(sets) > 0 || totalVolume(sets) > 0
}

/** Date-ascending {date, top, volume} points for one exercise; empty entries skipped. */
export function exerciseHistory(ws: Workout[], exerciseId: string): HistoryPoint[] {
  const points: HistoryPoint[] = []
  for (const w of ws) {
    const sets = setsFor(w, exerciseId)
    if (!isMeaningful(sets)) continue
    points.push({
      date: w.workout_date,
      top: topSetWeight(sets),
      volume: totalVolume(sets),
    })
  }
  return points.sort((a, b) => a.date.localeCompare(b.date))
}

/** Most recent meaningful entry strictly before `beforeDate`, or null. */
export function lastEntryFor(
  ws: Workout[],
  exerciseId: string,
  beforeDate: string,
): { date: string; sets: SetEntry[] } | null {
  let best: { date: string; sets: SetEntry[] } | null = null
  for (const w of ws) {
    if (w.workout_date >= beforeDate) continue
    const sets = setsFor(w, exerciseId)
    if (!isMeaningful(sets)) continue
    if (!best || w.workout_date > best.date) {
      best = { date: w.workout_date, sets }
    }
  }
  return best
}

/** PR = strictly beats every earlier session. First session is a baseline, not a PR. */
export function prState(
  ws: Workout[],
  exerciseId: string,
  date: string,
): { topPR: boolean; volumePR: boolean } {
  const history = exerciseHistory(ws, exerciseId)
  const current = history.find((p) => p.date === date)
  const earlier = history.filter((p) => p.date < date)
  if (!current || earlier.length === 0) {
    return { topPR: false, volumePR: false }
  }
  const bestTop = Math.max(...earlier.map((p) => p.top))
  const bestVolume = Math.max(...earlier.map((p) => p.volume))
  return {
    topPR: current.top > bestTop,
    volumePR: current.volume > bestVolume,
  }
}
