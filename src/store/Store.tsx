import type { Session } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as api from '../lib/api'
import type { Exercise, Template, TemplateItem } from '../lib/api'
import { demoData } from '../lib/demo'
import type { Workout } from '../lib/stats'
import { supabase } from '../lib/supabase'

/** Dev-only: VITE_DEMO=1 boots the app with fake local data, no backend. */
const DEMO = import.meta.env.VITE_DEMO === '1'

const CACHE_KEY = DEMO ? 'hw-cache-demo' : 'hw-cache-v1'

const DEMO_SESSION = {
  user: { email: 'demo@heavyweight.local' },
} as unknown as Session

type Data = api.AllData

const EMPTY: Data = { exercises: [], templates: [], workouts: [] }

function readCache(): Data | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as Data) : null
  } catch {
    return null
  }
}

function writeCache(data: Data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // storage full/blocked: mirror is best-effort only
  }
}

type StoreValue = {
  configured: boolean
  authReady: boolean
  session: Session | null
  dataReady: boolean
  offline: boolean
  exercises: Exercise[]
  templates: Template[]
  workouts: Workout[]
  exerciseName: (id: string) => string
  addExercise: (name: string) => Promise<Exercise>
  renameExercise: (id: string, name: string) => Promise<void>
  removeExercise: (id: string) => Promise<string | null>
  saveTemplate: (t: { id?: string; name: string; items: TemplateItem[] }) => Promise<void>
  removeTemplate: (id: string) => Promise<void>
  saveWorkout: (w: Workout) => Promise<Workout>
  removeWorkout: (id: string) => Promise<void>
  signInWithEmail: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const configured = DEMO || supabase !== null
  const [session, setSession] = useState<Session | null>(DEMO ? DEMO_SESSION : null)
  const [authReady, setAuthReady] = useState(DEMO || !configured)
  const [dataReady, setDataReady] = useState(false)
  const [offline, setOffline] = useState(false)
  const [data, setData] = useState<Data>(EMPTY)

  useEffect(() => {
    if (DEMO || !supabase) return
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setAuthReady(true)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  /** Apply a local mutation and keep the offline mirror in sync. */
  const apply = useCallback((fn: (d: Data) => Data) => {
    setData((prev) => {
      const next = fn(prev)
      writeCache(next)
      return next
    })
  }, [])

  const reload = useCallback(async () => {
    if (DEMO) {
      setData(demoData())
      setOffline(false)
      setDataReady(true)
      return
    }
    try {
      let all = await api.fetchAll()
      if (all.exercises.length === 0) {
        const seeded = await api.seedIfEmpty()
        if (seeded) all = await api.fetchAll()
      }
      setData(all)
      writeCache(all)
      setOffline(false)
    } catch {
      const cached = readCache()
      if (cached) setData(cached)
      setOffline(true)
    } finally {
      setDataReady(true)
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setDataReady(false)
      setData(EMPTY)
      return
    }
    void reload()
  }, [session, reload])

  const nameById = useMemo(
    () => new Map(data.exercises.map((e) => [e.id, e.name])),
    [data.exercises],
  )

  const exerciseName = useCallback(
    (id: string) => nameById.get(id) ?? '(deleted exercise)',
    [nameById],
  )

  const addExercise = useCallback(
    async (name: string): Promise<Exercise> => {
      const trimmed = name.trim()
      const existing = data.exercises.find(
        (e) => e.name.toLowerCase() === trimmed.toLowerCase(),
      )
      if (existing) return existing // canonical names: never create a near-duplicate
      const created = DEMO
        ? { id: crypto.randomUUID(), name: trimmed }
        : await api.createExercise(trimmed)
      apply((d) => ({
        ...d,
        exercises: [...d.exercises, created].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      }))
      return created
    },
    [data.exercises, apply],
  )

  const renameExercise = useCallback(
    async (id: string, name: string) => {
      if (!DEMO) await api.renameExercise(id, name)
      apply((d) => ({
        ...d,
        exercises: d.exercises
          .map((e) => (e.id === id ? { ...e, name: name.trim() } : e))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
    },
    [apply],
  )

  const removeExercise = useCallback(
    async (id: string): Promise<string | null> => {
      const inWorkouts = data.workouts.some((w) =>
        w.entries.some((e) => e.exercise_id === id),
      )
      if (inWorkouts) return 'This exercise has logged history, so it cannot be deleted.'
      const inTemplates = data.templates.some((t) =>
        t.items.some((i) => i.exercise_id === id),
      )
      if (inTemplates) return 'This exercise is used in a template. Remove it there first.'
      if (!DEMO) await api.deleteExercise(id)
      apply((d) => ({ ...d, exercises: d.exercises.filter((e) => e.id !== id) }))
      return null
    },
    [data.workouts, data.templates, apply],
  )

  const saveTemplate = useCallback(
    async (t: { id?: string; name: string; items: TemplateItem[] }) => {
      const saved = DEMO
        ? { id: t.id ?? crypto.randomUUID(), name: t.name, items: t.items }
        : await api.saveTemplate(t)
      apply((d) => ({
        ...d,
        templates: [...d.templates.filter((x) => x.id !== saved.id), saved].sort(
          (a, b) => a.name.localeCompare(b.name),
        ),
      }))
    },
    [apply],
  )

  const removeTemplate = useCallback(
    async (id: string) => {
      if (!DEMO) await api.deleteTemplate(id)
      apply((d) => ({ ...d, templates: d.templates.filter((t) => t.id !== id) }))
    },
    [apply],
  )

  const saveWorkout = useCallback(
    async (w: Workout): Promise<Workout> => {
      const saved = DEMO ? { ...w, id: w.id ?? crypto.randomUUID() } : await api.saveWorkout(w)
      apply((d) => ({
        ...d,
        workouts: [
          ...d.workouts.filter((x) => x.workout_date !== saved.workout_date),
          saved,
        ].sort((a, b) => a.workout_date.localeCompare(b.workout_date)),
      }))
      return saved
    },
    [apply],
  )

  const removeWorkout = useCallback(
    async (id: string) => {
      if (!DEMO) await api.deleteWorkout(id)
      apply((d) => ({ ...d, workouts: d.workouts.filter((w) => w.id !== id) }))
    },
    [apply],
  )

  const signInWithEmail = useCallback(async (email: string) => {
    if (DEMO) return
    if (!supabase) throw new Error('Supabase is not configured')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (DEMO || !supabase) return
    await supabase.auth.signOut()
    localStorage.removeItem(CACHE_KEY)
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      configured,
      authReady,
      session,
      dataReady,
      offline,
      exercises: data.exercises,
      templates: data.templates,
      workouts: data.workouts,
      exerciseName,
      addExercise,
      renameExercise,
      removeExercise,
      saveTemplate,
      removeTemplate,
      saveWorkout,
      removeWorkout,
      signInWithEmail,
      signOut,
    }),
    [
      configured,
      authReady,
      session,
      dataReady,
      offline,
      data,
      exerciseName,
      addExercise,
      renameExercise,
      removeExercise,
      saveTemplate,
      removeTemplate,
      saveWorkout,
      removeWorkout,
      signInWithEmail,
      signOut,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
