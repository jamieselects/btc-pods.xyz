import { NextResponse } from "next/server";
import { handleProcessEpisodesCron } from "@/lib/cron/handleProcessEpisodesCron";

export const runtime = "nodejs";
/** Whisper + ffmpeg + Haiku — align with Fluid / Pro limits (adjust if plan cap differs). */
export const maxDuration = 800;

/**
 * Per-show cron entry: `/api/cron/process-episodes/[slug]`
 *
 * Configure one Vercel Cron per active podcast so each RSS feed is checked at least
 * once per day on a staggered schedule (see `scripts/generate-vercel-crons.ts`).
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug: raw } = await ctx.params;
  const slug = decodeURIComponent(raw ?? "").trim() || null;
  if (!slug) {
    return NextResponse.json({ error: "missing slug" }, { status: 400 });
  }
  return handleProcessEpisodesCron(req, { slug });
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  return POST(req, ctx);
}
