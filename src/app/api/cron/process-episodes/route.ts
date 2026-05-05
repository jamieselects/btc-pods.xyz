import { NextResponse } from "next/server";
import { env, hasEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";
import { processPodcast } from "@/lib/pipeline/processPodcast";
import { getPostHogServer } from "@/lib/posthog";
import type { PodcastRow } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Must match `schedule` in vercel.json (minutes between cron ticks). */
const CRON_PERIOD_MINUTES = 30;

/**
 * Disjoint batches indexed 0..BATCH_COUNT-1. Each 30-minute tick processes one batch.
 * 48 ticks/day → each batch runs 48 / BATCH_COUNT times per UTC day (= 2 when BATCH_COUNT is 24).
 */
const BATCH_COUNT = 24;

/** Default episodes to process per podcast per cron invocation (pipeline default is 3). */
const BATCH_DEFAULT_MAX_EPISODES_PER_PODCAST = 1;

/**
 * Cron entry point (every 30 minutes on Vercel). Processes one round-robin batch of active
 * podcasts so the full catalog is covered frequently without timeouts. Idempotent on episode.guid.
 *
 * Without `slug`, podcasts are sorted by id and filtered to `batchId` where:
 * `batchId = floor(Date.now() / (CRON_PERIOD_MINUTES * 60_000)) % BATCH_COUNT`
 * and `index(podcast) % BATCH_COUNT === batchId`. Each show appears in exactly one batch per tick
 * and is visited twice per UTC day when BATCH_COUNT is 24 and the schedule runs 48×/day.
 *
 * Auth: requires `Authorization: Bearer ${CRON_SECRET}`. Vercel Cron sends
 * this header automatically when CRON_SECRET is set on the project.
 *
 * Query params (all optional):
 *   ?slug=foo              — process only this podcast slug (skips batching)
 *   ?dryRun=1              — skip actual email sends (recipients list forced empty)
 *   ?lookbackDays=3        — override default 7-day window
 *   ?maxPerRun=5           — override batch default cap (omit → 1 episode/podcast/run in batch mode,
 *                          or pipeline default 3 when slug selects a single show)
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Graceful degradation when the project isn't fully wired up yet.
  if (!hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("SUPABASE_SERVICE_ROLE_KEY")) {
    return NextResponse.json({
      ok: false,
      skipped: true,
      reason: "Supabase env vars missing",
    });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const dryRun = url.searchParams.get("dryRun") === "1";
  const lookbackDays =
    Number(url.searchParams.get("lookbackDays")) || undefined;
  const maxPerRunParam = url.searchParams.get("maxPerRun");
  let maxEpisodesPerRun =
    maxPerRunParam !== null && maxPerRunParam !== ""
      ? Number(maxPerRunParam) || undefined
      : undefined;
  const appBaseUrl = `${url.protocol}//${url.host}`;

  const db = createServiceClient();

  let query = db.from("podcasts").select("*").eq("is_active", true);
  if (slug) query = query.eq("slug", slug);
  const { data: podcasts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sorted =
    podcasts == null ? [] : ([...(podcasts as PodcastRow[])] as PodcastRow[]);
  sorted.sort((a, b) => a.id.localeCompare(b.id, "en"));

  const batchMode = !slug;
  const batchPeriodMs = CRON_PERIOD_MINUTES * 60 * 1000;
  const batchId =
    Math.floor(Date.now() / batchPeriodMs) % BATCH_COUNT;
  let toProcess = sorted;

  if (batchMode) {
    toProcess = sorted.filter(
      (_, index) => index % BATCH_COUNT === batchId,
    );
    if (maxEpisodesPerRun === undefined) {
      maxEpisodesPerRun = BATCH_DEFAULT_MAX_EPISODES_PER_PODCAST;
    }
  }

  const startedAt = Date.now();
  const reports = [] as Awaited<ReturnType<typeof processPodcast>>[];
  for (const podcast of toProcess) {
    try {
      const report = await processPodcast(podcast, db, appBaseUrl, {
        lookbackDays,
        maxEpisodesPerRun,
        recipientsOverride: dryRun ? [] : undefined,
      });
      reports.push(report);
    } catch (err) {
      reports.push({
        podcastId: podcast.id,
        slug: podcast.slug,
        processedCount: 0,
        episodes: [],
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const posthog = getPostHogServer();
  if (posthog) await posthog.shutdown();

  const body: Record<string, unknown> = {
    ok: true,
    durationMs: Date.now() - startedAt,
    dryRun,
    podcastCount: reports.length,
    totalProcessed: reports.reduce((n, r) => n + r.processedCount, 0),
    reports,
  };

  if (batchMode) {
    body.batch = {
      id: batchId,
      partitionCount: BATCH_COUNT,
      periodMinutes: CRON_PERIOD_MINUTES,
      ticksPerUtcDay: (24 * 60) / CRON_PERIOD_MINUTES,
      visitsPerShowPerUtcDay: (24 * 60) / CRON_PERIOD_MINUTES / BATCH_COUNT,
      activePodcastTotal: sorted.length,
    };
  }

  return NextResponse.json(body);
}

/** Allow manual triggering over GET during development. */
export async function GET(req: Request) {
  return POST(req);
}
