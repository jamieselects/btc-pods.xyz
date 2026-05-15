import { NextResponse } from "next/server";
import { env, hasEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";
import { processPodcast } from "@/lib/pipeline/processPodcast";
import { getPostHogServer } from "@/lib/posthog";
import type { PodcastRow } from "@/lib/supabase/types";

/** Must match batch `schedule` in vercel.json when using the multi-show route. */
export const CRON_PERIOD_MINUTES = 30;

/** Disjoint batches indexed 0..BATCH_COUNT-1. */
export const BATCH_COUNT = 24;

const BATCH_DEFAULT_MAX_EPISODES_PER_PODCAST = 1;

/**
 * Default for a single-show invocation (path or `?slug=`). One episode per tick
 * stays under long Whisper + ffmpeg + Haiku budgets on Vercel.
 */
const SINGLE_SHOW_DEFAULT_MAX_EPISODES = 1;

export type ProcessEpisodesCronContext = {
  /** When set, only this podcast row is loaded (must be active). */
  slug: string | null;
};

/**
 * Shared cron handler: batch mode when `slug` is null, otherwise one show.
 * Auth: `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function handleProcessEpisodesCron(
  req: Request,
  ctx: ProcessEpisodesCronContext,
): Promise<Response> {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("SUPABASE_SERVICE_ROLE_KEY")) {
    return NextResponse.json({
      ok: false,
      skipped: true,
      reason: "Supabase env vars missing",
    });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "1";
  const lookbackDays =
    Number(url.searchParams.get("lookbackDays")) || undefined;
  const maxPerRunParam = url.searchParams.get("maxPerRun");
  let maxEpisodesPerRun =
    maxPerRunParam !== null && maxPerRunParam !== ""
      ? Number(maxPerRunParam) || undefined
      : undefined;
  const appBaseUrl =
    env.APP_BASE_URL?.replace(/\/$/, "") ||
    env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    `${url.protocol}//${url.host}`;

  const db = createServiceClient();

  let query = db.from("podcasts").select("*").eq("is_active", true);
  if (ctx.slug) query = query.eq("slug", ctx.slug);
  const { data: podcasts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sorted =
    podcasts == null ? [] : ([...(podcasts as PodcastRow[])] as PodcastRow[]);
  sorted.sort((a, b) => a.id.localeCompare(b.id, "en"));

  const batchMode = !ctx.slug;
  const batchPeriodMs = CRON_PERIOD_MINUTES * 60 * 1000;
  const batchId =
    Math.floor(Date.now() / batchPeriodMs) % BATCH_COUNT;
  let toProcess = sorted;

  if (ctx.slug && sorted.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `no active podcast with slug: ${ctx.slug}`,
      },
      { status: 404 },
    );
  }

  if (batchMode) {
    toProcess = sorted.filter(
      (_, index) => index % BATCH_COUNT === batchId,
    );
    if (maxEpisodesPerRun === undefined) {
      maxEpisodesPerRun = BATCH_DEFAULT_MAX_EPISODES_PER_PODCAST;
    }
  } else if (maxEpisodesPerRun === undefined) {
    maxEpisodesPerRun = SINGLE_SHOW_DEFAULT_MAX_EPISODES;
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
      visitsPerShowPerUtcDay:
        (24 * 60) / CRON_PERIOD_MINUTES / BATCH_COUNT,
      activePodcastTotal: sorted.length,
    };
  } else if (ctx.slug) {
    body.slug = ctx.slug;
  }

  return NextResponse.json(body);
}
