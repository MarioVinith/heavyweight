-- HEAVYWEIGHT schema
-- Paste this whole file into the Supabase SQL editor and press Run.
-- Safe to run once on a fresh project.

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  -- [{ exercise_id, label, target_sets, target_reps }]
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout_date date not null,
  -- [{ exercise_id, label?, target_reps?, sets: [{ weight, reps }] }]
  entries jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, workout_date)
);

-- Row-level security: every row is visible/writable only by its owner.
alter table public.exercises enable row level security;
alter table public.templates enable row level security;
alter table public.workouts enable row level security;

create policy "own exercises" on public.exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own templates" on public.templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own workouts" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
