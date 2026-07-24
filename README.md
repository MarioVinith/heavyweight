# HEAVYWEIGHT 🥊

Personal weights tracker with a Rocky attitude. Log your sets, beat last week,
watch the graph go up.

- **Stack**: Vite + React + TypeScript · Supabase (Postgres, magic-link auth, RLS) · Recharts · PWA
- **Runs on**: Netlify free tier + Supabase free tier ($0)
- **One user**: you. Row-level security locks every row to your account.

## Development

```bash
pnpm install
pnpm dev        # http://localhost:5173 (VITE_DEMO=1 in .env.local = fake data, no backend)
pnpm test       # vitest unit tests for the domain logic
pnpm build      # typecheck + production build
pnpm icons      # regenerate PWA icons from public/icon.svg
```

## Setup from zero

See [docs/SETUP.md](docs/SETUP.md) — Supabase project, GitHub, Netlify, and
phone install, click by click.

## Layout

- `src/lib/` — pure domain logic (dates, stats/PRs, seed) + Supabase API
- `src/store/Store.tsx` — auth + data context, offline mirror, auto-seed
- `src/screens/` — Login, Calendar, Day (logging), Progress, Setup
- `supabase/schema.sql` — the entire database
- `docs/superpowers/plans/` — the implementation plan this was built from
