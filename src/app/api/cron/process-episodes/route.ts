import { NextResponse } from "next/server";
import { handleProcessEpisodesCron } from "@/lib/cron/handleProcessEpisodesCron";

export const runtime = "nodejs";
/** Legacy batch route processes a subset of shows per tick — keep below per-show cap. */
export const maxDuration = 300;

/**
 * Batch cron (optional): one tick processes `1 / BATCH_COUNT` of active podcasts.
 * Prefer `/api/cron/process-episodes/[slug]` + generated `vercel.json` for Whisper-heavy workloads.
 *
 * Query params (optional):
 *   ?slug=foo       — process only this podcast (prefer `[slug]` route for crons)
 *   ?dryRun=1
 *   ?lookbackDays=
 *   ?maxPerRun=
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim() || null;
  return handleProcessEpisodesCron(req, { slug });
}

export async function GET(req: Request) {
  return POST(req);
}
