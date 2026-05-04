import Link from "next/link";
import { PodcastCard } from "@/components/PodcastCard";
import { SummaryCard } from "@/components/SummaryCard";
import { requireUser } from "@/lib/dal";
import {
  listRecentSummariesForUser,
  listUserSubscribedPodcasts,
} from "@/lib/podcasts";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [subscribed, recent] = await Promise.all([
    listUserSubscribedPodcasts(user.id),
    listRecentSummariesForUser(user.id, 10),
  ]);

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10 flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Signed in as {user.email}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your dashboard
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground">
            New summaries appear here and in your inbox after each morning&apos;s
            pipeline run.
          </p>
        </header>

        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Subscribed podcasts
            </h2>
            <Link
              href="/podcasts"
              className="text-sm text-primary hover:underline"
            >
              Browse library →
            </Link>
          </div>

          {subscribed.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
              You haven&apos;t subscribed to anything yet.{" "}
              <Link href="/podcasts" className="text-primary hover:underline">
                Browse the library
              </Link>{" "}
              and tap Subscribe to start getting digests.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subscribed.map((p) => (
                <PodcastCard
                  key={p.id}
                  slug={p.slug}
                  name={p.name}
                  tagline={p.tagline ?? ""}
                  coverImageUrl={p.cover_image_url}
                  subscribe={{
                    podcastId: p.id,
                    initialSubscribed: true,
                    isAuthenticated: true,
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold tracking-tight">
            Recent summaries
          </h2>

          {recent.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
              No summaries yet. The daily cron delivers them at 08:00 UTC.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.map((s) => (
                <SummaryCard
                  key={s.episodeId}
                  episodeId={s.episodeId}
                  podcastName={s.podcastName}
                  episodeTitle={s.episodeTitle}
                  publishedAt={s.publishedAt ?? new Date()}
                  keyTopics={s.keyTopics ?? undefined}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
