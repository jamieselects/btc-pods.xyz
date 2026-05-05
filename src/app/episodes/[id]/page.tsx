import Link from "next/link";
import { notFound } from "next/navigation";
import { SponsorshipBody } from "@/components/SponsorshipBody";
import { SummarySectionWeb } from "@/components/SummarySectionBodyWeb";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { getEpisodeWithSummary } from "@/lib/podcasts";
import { cleanSectionBody } from "@/lib/summarySectionFormat";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const ep = await getEpisodeWithSummary(id);
  return {
    title: ep?.title ?? "Episode summary",
  };
}

export default async function EpisodeSummaryPage({ params }: Props) {
  const { id } = await params;
  const episode = await getEpisodeWithSummary(id);
  if (!episode) notFound();

  const { summary, podcast } = episode;
  const sponsorshipDisplay =
    summary?.sponsorships?.trim()
      ? cleanSectionBody(summary.sponsorships, "sponsor").trim()
      : "";

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <article className="mx-auto w-full max-w-3xl">
        <header className="mb-8 flex flex-col gap-2">
          {podcast ? (
            <Link
              href={`/podcasts/${podcast.slug}`}
              className="font-mono text-xs uppercase tracking-widest text-primary hover:underline"
            >
              ← {podcast.name}
            </Link>
          ) : null}
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {episode.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {episode.published_at
              ? new Date(episode.published_at).toLocaleDateString()
              : null}
            {episode.duration_seconds
              ? ` · ${Math.round(episode.duration_seconds / 60)} min`
              : null}
            {episode.transcript_source
              ? ` · transcript via ${episode.transcript_source}`
              : null}
          </p>
        </header>

        {summary ? (
          <div className="flex flex-col gap-8 text-sm leading-relaxed">
            {sponsorshipDisplay ? (
              <section>
                <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
                  Episode sponsorships
                </h2>
                <SponsorshipBody text={sponsorshipDisplay} />
              </section>
            ) : null}

            <SummarySectionWeb
              title="Key topics"
              text={summary.key_topics}
              kind="key"
            />
            <SummarySectionWeb
              title="Market & price signals"
              text={summary.market_signals}
              kind="market"
            />
            <SummarySectionWeb
              title="Actionable insights"
              text={summary.actionable_insights}
              kind="action"
            />

            <TranscriptPanel
              transcript={episode.transcript}
              episodeTitle={episode.title}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
            No summary has been generated for this episode yet.
          </div>
        )}
      </article>
    </main>
  );
}
