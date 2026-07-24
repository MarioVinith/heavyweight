# HEAVYWEIGHT — One-Time Setup Guide

Everything here is done once. Total time: ~20 minutes. Everything is on free tiers.

---

## Part A — Create the Supabase project (your database + login)

1. Go to **https://supabase.com** → **Start your project** → sign in **with GitHub**.
2. Click **New project**:
   - Name: `heavyweight`
   - Database password: click **Generate a password** and save it somewhere safe
     (you'll almost never need it — and never paste it into the app or chat).
   - Region: **Sydney (ap-southeast-2)**
   - Plan: **Free**
3. Wait ~2 minutes while it provisions.

## Part B — Create the tables

1. In the Supabase left sidebar: **SQL Editor** → **New query**.
2. Open [`supabase/schema.sql`](../supabase/schema.sql) from this repo, copy the
   whole file, paste it in, press **Run**. You should see "Success. No rows returned".

## Part C — Get the two keys the app needs

1. Left sidebar: **Project Settings** (gear) → **API**.
2. Copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public key** (a long string — this one is *designed* to be public;
     row-level security is what actually protects your data)
3. Put them in `.env.local` in this repo:

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR-LONG-KEY
   ```

   …and remove the `VITE_DEMO=1` line. Restart `pnpm dev`.

## Part D — Point magic-link emails at the app

1. Supabase left sidebar: **Authentication** → **URL Configuration**.
2. **Site URL**: `http://localhost:5173` for now.
3. After Netlify deploy (Part F), come back and change Site URL to your
   production URL (e.g. `https://heavyweight.netlify.app`) and add
   `http://localhost:5173/**` under **Redirect URLs** so local dev keeps working.

> Free-tier note: Supabase's built-in email sender allows only a few emails per
> hour — fine for one person, and you stay signed in for a long time anyway.

## Part D½ — Logging in from the installed iPhone app

iOS home-screen apps can't log in via the emailed link (links always open in
Safari, and the installed app has its own separate storage). Two ways around it:

**Paste the link (works out of the box):** in the app, request the magic link
→ open the email in Mail → **long-press the "Log In" link → Copy Link** →
switch back to the app → paste it into the verify box. The link is one-time
and expires after a few minutes, so paste it soon after it arrives.

**Optional upgrade — 6-digit code:** Supabase only lets you edit email
templates once you configure custom SMTP (Authentication → Emails → SMTP
settings; a free sender like Resend works). With SMTP set up, add
`<p>Your one-time code: {{ .Token }}</p>` to the Magic Link template and the
app's verify box accepts the code directly. Custom SMTP also removes the
built-in sender's ~2-4 emails/hour rate limit.

## Part E — Put the code on GitHub (private repo)

1. Go to **https://github.com/new**:
   - Name: `heavyweight` (or anything)
   - Visibility: **Private**
   - Do NOT initialize with README (the repo already has history).
2. Follow the "push an existing repository" commands GitHub shows, e.g.:

   ```
   git remote add origin git@github.com:YOURNAME/heavyweight.git
   git push -u origin main
   ```

## Part F — Deploy on Netlify

1. **https://app.netlify.com** → **Add new site** → **Import an existing project** → **GitHub** → pick the `heavyweight` repo.
2. Build settings are auto-detected from `netlify.toml` (build `pnpm build`, publish `dist`).
3. Before deploying, open **Site configuration → Environment variables** and add:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
4. Deploy. Your app is live at `https://<something>.netlify.app`
   (you can rename the subdomain under Site configuration → Site details).
5. Go back to Part D step 3 and set the production Site URL in Supabase.

## Part G — Install it on your phone

- **iPhone (Safari)**: open your Netlify URL → Share button → **Add to Home Screen**.
- **Android (Chrome)**: open the URL → ⋮ menu → **Install app**.

First login **in the installed app**: enter your email → SEND ME THE MAGIC LINK
→ open the email in Mail → long-press the link → **Copy Link** → paste it into
the app's verify box (don't tap the link; it would open Safari instead).
You stay signed in from then on.

First login **in a normal browser tab**: the magic link works directly.

Either way, the first-ever login seeds your exercise library and the
"Upper 2 – Block 1" template automatically. Go lift. 🥊

---

## Day-2 operations

- **Log a day**: Calendar → tap the day → APPLY template → type weights/reps → SAVE THE ROUND.
- **Trainer changed the plan?** Setup → edit the template, or make a new one per block.
- **New exercise mid-session?** Day screen → + ADD EXERCISE → "New exercise…".
- **See progress**: Progress tab → pick exercise → TOP SET or VOLUME.
- Data lives in your Supabase Postgres, mirrored to the device for offline viewing.
