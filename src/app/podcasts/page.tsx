import Link from "next/link";
import { PodcastsBrowse } from "@/components/PodcastsBrowse";
import { SuggestPodcastForm } from "@/components/SuggestPodcastForm";
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
            Curated Bitcoin shows — and you can add one with an RSS or page
            link below. Subscribe and we&apos;ll summarise new episodes within
            hours of release.
          </p>
        </header>

        {podcasts.length === 0 ? (
          <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
              No podcasts in the library yet. Add one with a link or RSS URL
              below, or{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                sign up
              </Link>{" "}
              for summaries when shows are available.
            </div>
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <SuggestPodcastForm />
            </div>
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
