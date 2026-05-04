import Link from "next/link";
import { PodcastsBrowse } from "@/components/PodcastsBrowse";
import { getCurrentUser } from "@/lib/dal";
import {
  listCuratedPodcastsWithHosts,
  listUserSubscriptionPodcastIds,
} from "@/lib/podcasts";

export const metadata = { title: "Browse podcasts" };

export default async function PodcastsPage() {
  const [podcasts, user] = await Promise.all([
    listCuratedPodcastsWithHosts(),
    getCurrentUser(),
  ]);
  const subscribedPodcastIds = user
    ? [...(await listUserSubscriptionPodcastIds(user.id))]
    : [];

  return (
    <main className="flex flex-1 flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Library
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Curated Bitcoin podcasts
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground">
            Every show here is hand-picked. Subscribe and we&apos;ll summarise
            new episodes within hours of release.
          </p>
        </header>

        {podcasts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
            No podcasts yet. Once Supabase is configured and seeded you&apos;ll
            see the curated list here.{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>{" "}
            to be notified when we launch.
          </div>
        ) : (
          <PodcastsBrowse
            podcasts={podcasts}
            isAuthenticated={Boolean(user)}
            subscribedPodcastIds={subscribedPodcastIds}
          />
        )}
      </div>
    </main>
  );
}
