import Link from "next/link";
import { notFound } from "next/navigation";
import { SubscribeButton } from "@/components/subscribe-button";
import { SummaryCard } from "@/components/SummaryCard";
import {
  getPodcastBySlug,
  listEpisodesForPodcast,
  listUserSubscriptionPodcastIds,
} from "@/lib/podcasts";
import { getCurrentUser } from "@/lib/dal";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug);
  return {
    title: podcast?.name ?? "Podcast",
    description: podcast?.tagline ?? undefined,
  };
}

export default async function PodcastDetailPage({ params }: Props) {
  const { slug } = await params;
  const podcast = await getPodcastBySlug(slug);
  if (!podcast) notFound();

  const [episodes, user] = await Promise.all([
    listEpisodesForPodcast(podcast.id),
    getCurrentUser(),
  ]);

  const subscribed = user
    ? (await listUserSubscriptionPodcastIds(user.id)).has(podcast.id)
    : false;

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              {podcast.is_curated ? "Curated" : "Community"}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {podcast.name}
            </h1>
            {podcast.tagline ? (
              <p className="text-sm text-muted-foreground">{podcast.tagline}</p>
            ) : null}
            {podcast.description ? (
              <p className="mt-2 max-w-prose text-sm text-foreground/80">
                {podcast.description}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {podcast.publishing_frequency ? (
                <span>📅 {podcast.publishing_frequency}</span>
              ) : null}
              {podcast.year_started ? (
                <span>Since {podcast.year_started}</span>
              ) : null}
              {podcast.website_url ? (
                <Link
                  href={podcast.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Visit site ↗
                </Link>
              ) : null}
              {podcast.spotify_url ? (
                <Link
                  href={podcast.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Spotify ↗
                </Link>
              ) : null}
            </div>
          </div>

          <div className="shrink-0">
            <SubscribeButton
              podcastId={podcast.id}
              initialSubscribed={subscribed}
              isAuthenticated={Boolean(user)}
            />
          </div>
        </header>

        <section>
          <h2 className="mb-4 text-lg font-semibold tracking-tight">
            Recent episodes
          </h2>

          {episodes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
              No episodes summarised yet. Check back after the next daily run.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {episodes.map((ep) => (
                <SummaryCard
                  key={ep.id}
                  episodeId={ep.id}
                  podcastName={podcast.name}
                  episodeTitle={ep.title}
                  publishedAt={ep.published_at ?? ep.created_at}
                  keyTopics={ep.summary?.key_topics ?? undefined}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
