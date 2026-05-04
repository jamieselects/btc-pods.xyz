import Image from "next/image";
import Link from "next/link";
import { SubscribeButton } from "@/components/subscribe-button";

export type PodcastCardSubscribeContext = {
  podcastId: string;
  initialSubscribed: boolean;
  isAuthenticated: boolean;
};

export type PodcastCardProps = {
  slug: string;
  name: string;
  tagline: string;
  coverImageUrl?: string | null;
  hostNames?: string[];
  subscribe?: PodcastCardSubscribeContext | null;
};

export function PodcastCard({
  slug,
  name,
  tagline,
  coverImageUrl,
  hostNames,
  subscribe,
}: PodcastCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground transition hover:border-primary/40">
      <Link
        href={`/podcasts/${slug}`}
        className="group flex min-h-0 flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-square w-full bg-muted">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={`${name} cover art`}
              fill
              className="object-cover transition group-hover:opacity-95"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-2xl text-muted-foreground">
              ₿
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-4">
          <h3 className="font-semibold leading-tight group-hover:text-primary">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{tagline}</p>
          {hostNames?.length ? (
            <p className="font-mono text-xs text-muted-foreground">
              {hostNames.join(" · ")}
            </p>
          ) : null}
        </div>
      </Link>
      {subscribe ? (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <SubscribeButton
            key={`${subscribe.podcastId}-${subscribe.initialSubscribed}`}
            podcastId={subscribe.podcastId}
            initialSubscribed={subscribe.initialSubscribed}
            isAuthenticated={subscribe.isAuthenticated}
            fullWidth
          />
        </div>
      ) : null}
    </div>
  );
}
