# ₿ Bitcoin Podcast Summarizer

AI-generated summaries of Bitcoin podcasts, delivered to your inbox. Free,
fast, Bitcoin-native. Built per
[`docs/btc-podcast-summarizer-technical-design.docx`](docs/btc-podcast-summarizer-technical-design.docx).

> **Status: phase 2 MVP.** Supabase email+password auth, curated podcast
> browsing, per-user subscriptions, daily cron pipeline (RSS → Claude
> Haiku → Resend digests), and PostHog cost instrumentation are all wired
> up. Phase 3 layers on Strike donations and Whisper transcription.

## Stack

| Concern         | Choice                                             |
| --------------- | -------------------------------------------------- |
| Framework       | Next.js 16 (App Router) — TypeScript, `src/` dir   |
| Styling         | Tailwind CSS v4 + shadcn/ui (radix-nova preset)    |
| Database / Auth | Supabase (PostgreSQL + RLS + Auth)                 |
| AI              | Anthropic Claude Haiku 4.5 (summaries)             |
| Transcription   | OpenAI Whisper (phase 3, fallback only)            |
| Email           | Resend + React Email                               |
| Donations       | Strike for Business (Lightning, phase 3)           |
| Analytics       | PostHog (server + client)                          |
| Cron            | Vercel Cron, daily at 08:00 UTC                    |

> The design doc was written against Next.js 14. We use the latest stable
> (Next.js 16) — same App Router primitives, no behaviour change for this app.

## Getting started

```bash
# 1. Install deps
npm install

# 2. Copy env template and fill in real values when you have them
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

Visit <http://localhost:3000>.

## Project layout

```
src/
  app/
    (auth)/            # sign-in / sign-up (phase 2)
    dashboard/         # user dashboard (phase 2)
    podcasts/          # public browse + subscribe
    episodes/[id]/     # public episode summary page
    api/
      auth/callback/
      cron/process-episodes/    # daily cron entry point
      donate/{create-invoice,webhook}/   # phase 3
      podcasts/{,add}/
      subscriptions/
      summaries/[episodeId]/
  components/          # PodcastCard, SummaryCard, DonateButton, etc.
  emails/              # React Email templates
  lib/
    env.ts             # zod-validated env vars
    posthog.ts         # server-side PostHog + cost helpers
    strike.ts          # Strike API client (phase 3)
    pipeline/          # fetchRss, resolveTranscript, summarise, sendDigest
    supabase/          # browser + server clients
supabase/
  migrations/
    001_init.sql               # 8 tables + RLS
    002_seed_podcasts.sql      # WBD, Stephan Livera, The Hurdle Rate
docs/                  # design doc + future architecture notes
vercel.json            # cron config
```

## Environment variables

See [`.env.example`](.env.example) for the full list. None of the API keys are
required for `npm run build` / `npm run dev` in phase 1 — the typed env loader
keeps them optional and call sites that need them throw a clear error.

When you're ready to wire up real services, populate `.env.local` and the
matching values in your Vercel project settings.

## Database

Migrations live in [`supabase/migrations/`](supabase/migrations). To apply
them locally with the Supabase CLI:

```bash
# install once: brew install supabase/tap/supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Or paste the SQL directly into the Supabase SQL editor.

## Cron

`vercel.json` schedules `POST /api/cron/process-episodes` daily at 08:00 UTC.
The route checks `Authorization: Bearer ${CRON_SECRET}`. To run it locally:

```bash
curl -X POST -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)" \
  http://localhost:3000/api/cron/process-episodes
```

## Roadmap

- [x] **Phase 1 — Scaffold.** Folders, schema, env, vercel.json, typed stubs.
- [x] **Phase 2 — MVP.** Supabase auth, browse/subscribe, daily cron pipeline
      with RSS-only transcripts, Claude summaries, Resend digests, PostHog
      cost events.
- [ ] **Phase 3 — Payments + Whisper.** Strike Lightning donations
      (invoice + webhook + UI) and Whisper transcription fallback inside
      `resolveTranscript`.

## Phase 2 — what shipped

- **Auth.** Email + password sign-up / sign-in / sign-out via Supabase,
  driven by React 19 `useActionState` server actions. Session cookies are
  refreshed on every request by `src/proxy.ts` (the Next.js 16 rename of
  `middleware.ts`). `src/lib/dal.ts` centralises `getCurrentUser()` /
  `requireUser()` for Server Components.
- **Browse + subscribe.** `/podcasts` renders curated feeds from the DB,
  `/podcasts/[slug]` shows episodes + a subscribe toggle, and a
  session-aware `SiteHeader` surfaces sign-in / dashboard links.
- **Dashboard.** `/dashboard` lists the user's subscriptions and the most
  recent summaries across every podcast they follow.
- **Cron pipeline.** `POST /api/cron/process-episodes` iterates active
  curated podcasts, fetches RSS, skips duplicates by `episodes.guid`,
  resolves transcripts (inline RSS + linked VTT/SRT/HTML), summarises
  with Claude Haiku, persists `episodes` + `summaries`, emails every
  subscriber via Resend, and logs each send into `delivery_log`. Each
  summary fires a PostHog `episode_summarised` event with Haiku +
  Whisper cost estimates.
- **Public API.** `GET /api/podcasts`, `POST/DELETE /api/subscriptions`,
  `POST /api/podcasts/add` (user-submitted RSS), and
  `GET /api/summaries/[episodeId]`.

## License

TBD.
