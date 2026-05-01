import { NextResponse } from "next/server";
import { env, hasEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";
import { processPodcast } from "@/lib/pipeline/processPodcast";
import { getPostHogServer } from "@/lib/posthog";
import type { PodcastRow } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Daily cron entry point. Iterates curated podcasts, processes new episodes,
 * generates summaries, and dispatches digest emails. Idempotent on episode.guid.
 *
 * Auth: requires `Authorization: Bearer ${CRON_SECRET}`. Vercel Cron sends
 * this header automatically when CRON_SECRET is set on the project.
 *
 * Query params (all optional):
 *   ?slug=foo              — process only this podcast slug
 *   ?dryRun=1              — skip actual email sends (recipients list forced empty)
 *   ?lookbackDays=3        — override default 7-day window
 *   ?maxPerRun=5           — override default 3 episodes/podcast/run cap
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
  const maxEpisodesPerRun =
    Number(url.searchParams.get("maxPerRun")) || undefined;
  const appBaseUrl = `${url.protocol}//${url.host}`;

  const db = createServiceClient();

  let query = db
    .from("podcasts")
    .select("*")
    .eq("is_active", true)
    .eq("is_curated", true);
  if (slug) query = query.eq("slug", slug);
  const { data: podcasts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const startedAt = Date.now();
  const reports = [] as Awaited<ReturnType<typeof processPodcast>>[];
  for (const podcast of (podcasts ?? []) as PodcastRow[]) {
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

  return NextResponse.json({
    ok: true,
    durationMs: Date.now() - startedAt,
    dryRun,
    podcastCount: reports.length,
    totalProcessed: reports.reduce((n, r) => n + r.processedCount, 0),
    reports,
  });
}

/** Allow manual triggering over GET during development. */
export async function GET(req: Request) {
  return POST(req);
}
