# ₿ Bitcoin Podcast Summarizer

AI-generated summaries of Bitcoin podcasts, delivered to your inbox. Free,
fast, Bitcoin-native. Built per
[`docs/btc-podcast-summarizer-technical-design.docx`](docs/btc-podcast-summarizer-technical-design.docx).

> **Status: phase 3.** On top of the phase 2 MVP (Supabase auth, browse +
> subscribe, daily cron pipeline, Resend digests, PostHog cost events),
> phase 3 adds OpenAI Whisper transcription as a fallback when an RSS
> feed doesn't ship a transcript, and Strike for Business Lightning
> donations (invoice + quote + webhook + QR modal).

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
| Cron            | Vercel Cron, hourly (`0 * * * *` UTC)              |

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
      cron/process-episodes/    # scheduled cron entry point
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

`vercel.json` schedules `POST /api/cron/process-episodes` every hour (`0 * * * *` UTC).

**Vercel plan:** Hobby only allows **one run per calendar day**; an hourly cron
**fails deployment** on Hobby (“limited to daily cron jobs”). Use **Pro** for
hourly schedules, or keep `0 8 * * *` and trigger the same URL from an
external scheduler (with `Authorization: Bearer $CRON_SECRET`) more often.
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
- [x] **Phase 3 — Payments + Whisper.** Whisper transcription fallback
      (`transcribeWithWhisper.ts` + ffmpeg-static compression) and Strike
      Lightning donations (invoice + quote + signed webhook + QR modal).

## Phase 3 — what shipped

- **Whisper fallback.** `src/lib/pipeline/transcribeWithWhisper.ts`
  downloads the audio enclosure to `/tmp` (250 MB safety cap), reencodes
  to mono 16 kHz Opus 16 kbps via `ffmpeg-static` if it would exceed
  Whisper's 25 MB upload limit, calls `whisper-1` with `verbose_json`
  for ground-truth duration, and always cleans up tmp files. Episodes
  longer than 3 hours are skipped before download. `resolveTranscript`
  now falls through silently from a thin/broken RSS transcript to the
  Whisper path. The cron pipeline emits a separate
  `whisper_transcription` PostHog event with cost in USD, and the
  `episode_summarised` event includes the combined Haiku + Whisper
  total.
- **Strike Lightning donations.** `src/lib/strike.ts` is a tiny client
  for `POST /v1/invoices`, `POST /v1/invoices/:id/quote`,
  `GET /v1/invoices/:id`, plus an HMAC-SHA256 webhook verifier that
  accepts the common Strike header variants. Routes:
  - `POST /api/donate/create-invoice` — body
    `{ amountSats: 100…10_000_000, description? }`. Creates a
    BTC-denominated invoice + Lightning quote, inserts a `pending`
    row in `donations`, returns `{ donationId, paymentRequest, expiresAt }`.
  - `POST /api/donate/webhook` — verifies the raw-body HMAC, then
    re-fetches the authoritative invoice state from Strike and flips
    the matching `donations` row to `paid` or `expired`. Idempotent
    (only updates rows still in `pending`).
  - `GET /api/donate/status/[id]` — minimal poll endpoint used by the
    `DonateButton` modal to show the "paid" state without waiting on
    a page reload.
- **Donate UI.** `src/components/DonateButton.tsx` is a Radix Dialog
  modal with sat-amount presets (1k / 5k / 21k / 100k / 1M) plus a
  custom input, an SVG QR via `qrcode.react`, copy-to-clipboard,
  expiry countdown, and a 3 s status poll. The button is rendered in
  `SiteHeader` only when `STRIKE_API_KEY` is set.

### Strike setup checklist

1. In the Strike dashboard, generate an API key with the
   `partner.invoice.create`, `partner.invoice.quote.generate`, and
   `partner.invoice.read` scopes (the dashboard has presets covering
   these).
2. Set `STRIKE_API_KEY` in `.env.local` (and your Vercel project).
3. Create a webhook subscription via
   `POST https://api.strike.me/v1/subscriptions`:
   ```bash
   curl -X POST https://api.strike.me/v1/subscriptions \
     -H "Authorization: Bearer $STRIKE_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "webhookUrl": "https://YOUR_DOMAIN/api/donate/webhook",
       "webhookVersion": "v1",
       "secret": "<10-50-char-secret>",
       "enabled": true,
       "eventTypes": ["invoice.updated"]
     }'
   ```
4. Set `STRIKE_WEBHOOK_SECRET` to the same value used above. The
   secret must be 10–50 characters per Strike's API contract.
5. Without `STRIKE_API_KEY` set, the donate button is hidden. Without
   `STRIKE_WEBHOOK_SECRET` set in production, the webhook returns 500
   so unsigned events can't write to your DB.

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
