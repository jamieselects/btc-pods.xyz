import { NextResponse } from "next/server";
import { getEpisodeWithSummary } from "@/lib/podcasts";

export const runtime = "nodejs";

type Params = { params: Promise<{ episodeId: string }> };

/** GET /api/summaries/[episodeId] — public summary fetch. */
export async function GET(_req: Request, { params }: Params) {
  const { episodeId } = await params;
  const episode = await getEpisodeWithSummary(episodeId);

  if (!episode || !episode.summary) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    episode: {
      id: episode.id,
      title: episode.title,
      published_at: episode.published_at,
      podcast: episode.podcast
        ? {
            id: episode.podcast.id,
            slug: episode.podcast.slug,
            name: episode.podcast.name,
          }
        : null,
    },
    summary: {
      key_topics: episode.summary.key_topics,
      market_signals: episode.summary.market_signals,
      actionable_insights: episode.summary.actionable_insights,
      full_summary_md: episode.summary.full_summary_md,
      model_used: episode.summary.model_used,
    },
  });
}
