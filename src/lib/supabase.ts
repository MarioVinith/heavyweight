import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url: string | undefined = import.meta.env.VITE_SUPABASE_URL
const anonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Null until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set in .env.local. */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null
