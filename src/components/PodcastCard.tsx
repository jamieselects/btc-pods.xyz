import Link from "next/link";
import Image from "next/image";

export type PodcastCardProps = {
  slug: string;
  name: string;
  tagline: string;
  coverImageUrl?: string | null;
  hostNames?: string[];
  isCurated?: boolean;
};

export function PodcastCard({
  slug,
  name,
  tagline,
  coverImageUrl,
  hostNames,
  isCurated,
}: PodcastCardProps) {
  return (
    <Link
      href={`/podcasts/${slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground transition hover:border-primary/40"
    >
      <div className="relative aspect-square w-full bg-muted">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={`${name} cover art`}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-2xl text-muted-foreground">
            ₿
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold leading-tight">{name}</h3>
          {isCurated ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
              Curated
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{tagline}</p>
        {hostNames?.length ? (
          <p className="font-mono text-xs text-muted-foreground">
            {hostNames.join(" · ")}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
