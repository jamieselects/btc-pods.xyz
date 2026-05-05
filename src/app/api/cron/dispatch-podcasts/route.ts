import { NextResponse } from "next/server";
import { env, hasEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";
import { handleProcessEpisodesCron } from "@/lib/cron/handleProcessEpisodesCron";
import {
  DISPATCH_SLOTS_PER_DAY,
  podcastIndicesForSlot,
  utcSlotIndexForDispatch,
} from "@/lib/cron/dispatchSchedule";
import type { PodcastRow } from "@/lib/supabase/types";

export const runtime = "nodejs";
/** Same budget as per-slug Whisper cron. */
export const maxDuration = 800;

/**
 * Single Vercel Cron entry: picks **one active podcast per tick** from the DB
 * using a deterministic daily schedule (no redeploy when shows are added).
 *
 * Requires `Authorization: Bearer ${CRON_SECRET}`. Cron in `vercel.json` must
 * run every `DISPATCH_CRON_PERIOD_MINUTES` UTC (see `dispatchSchedule.ts`).
 *
 * Manual override: `GET /api/cron/dispatch-podcasts?slug=foo` behaves like the
 * per-show cron for that slug.
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const slugOverride = url.searchParams.get("slug")?.trim();
  if (slugOverride) {
    return handleProcessEpisodesCron(req, { slug: slugOverride });
  }

  if (!hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("SUPABASE_SERVICE_ROLE_KEY")) {
    return NextResponse.json({
      ok: false,
      skipped: true,
      reason: "Supabase env vars missing",
    });
  }

  const db = createServiceClient();
  const { data: podcasts, error } = await db
    .from("podcasts")
    .select("*")
    .eq("is_active", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sorted =
    podcasts == null ? [] : ([...(podcasts as PodcastRow[])] as PodcastRow[]);
  sorted.sort((a, b) => a.id.localeCompare(b.id, "en"));

  const n = sorted.length;
  if (n === 0) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "no_active_podcasts",
    });
  }

  if (n > DISPATCH_SLOTS_PER_DAY) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many active podcasts (${n}). Max supported with ${DISPATCH_SLOTS_PER_DAY} daily slots is ${DISPATCH_SLOTS_PER_DAY}. Shorten DISPATCH_CRON_PERIOD_MINUTES or split projects.`,
      },
      { status: 500 },
    );
  }

  const slotIndex = utcSlotIndexForDispatch(new Date());
  const indices = podcastIndicesForSlot(slotIndex, n);

  if (indices.length === 0) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      slotIndex,
      podcastCount: n,
      reason: "no_podcast_scheduled_this_slot",
    });
  }

  if (indices.length > 1) {
    console.warn(
      `[dispatch-podcasts] slot ${slotIndex}: expected at most one podcast, got indices ${indices.join(",")}; processing first only`,
    );
  }

  const slug = sorted[indices[0]!].slug;
  return handleProcessEpisodesCron(req, { slug });
}

export async function GET(req: Request) {
  return POST(req);
}
