import Link from "next/link";
import { PodcastCard } from "@/components/PodcastCard";
import { listCuratedPodcasts } from "@/lib/podcasts";

export const metadata = { title: "Browse podcasts" };

export default async function PodcastsPage() {
  const podcasts = await listCuratedPodcasts();

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {podcasts.map((p) => (
              <PodcastCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                tagline={p.tagline ?? ""}
                coverImageUrl={p.cover_image_url}
                isCurated={p.is_curated}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
