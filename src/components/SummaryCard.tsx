import Link from "next/link";

export type SummaryCardProps = {
  episodeId: string;
  podcastName: string;
  episodeTitle: string;
  publishedAt: string | Date;
  keyTopics?: string;
};

export function SummaryCard({
  episodeId,
  podcastName,
  episodeTitle,
  publishedAt,
  keyTopics,
}: SummaryCardProps) {
  const dateStr =
    typeof publishedAt === "string"
      ? new Date(publishedAt).toLocaleDateString()
      : publishedAt.toLocaleDateString();

  return (
    <Link
      href={`/episodes/${episodeId}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5 text-card-foreground transition hover:border-primary/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-primary">
          {podcastName}
        </span>
        <time className="font-mono text-xs text-muted-foreground" dateTime={String(publishedAt)}>
          {dateStr}
        </time>
      </div>
      <h3 className="font-semibold leading-snug">{episodeTitle}</h3>
      {keyTopics ? (
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
          {keyTopics}
        </p>
      ) : null}
    </Link>
  );
}
