import Parser from "rss-parser";

/** Normalised item shape we use throughout the pipeline. */
export type RssItem = {
  guid: string;
  title: string;
  publishedAt: Date;
  audioUrl: string | null;
  durationSeconds: number | null;
  /** Inline transcript text if the RSS feed provides one (e.g. <podcast:transcript>). */
  transcriptText: string | null;
  /** External transcript URL if linked rather than inlined. */
  transcriptUrl: string | null;
  link: string | null;
};

type CustomItem = {
  "podcast:transcript"?: { url?: string; type?: string } | string;
  "itunes:duration"?: string;
  enclosure?: { url?: string };
};

const parser: Parser<unknown, CustomItem> = new Parser({
  customFields: {
    item: ["podcast:transcript", "itunes:duration"],
  },
});

/**
 * Fetch and parse an RSS feed into a normalised list of episode candidates.
 * Phase 2 wires this into the cron route; phase 1 just exports the parser.
 */
export async function fetchRss(rssUrl: string): Promise<RssItem[]> {
  const feed = await parser.parseURL(rssUrl);

  return (feed.items ?? []).map((item) => {
    const i = item as Parser.Item & CustomItem;
    const transcript = i["podcast:transcript"];
    let transcriptUrl: string | null = null;
    let transcriptText: string | null = null;

    if (typeof transcript === "object" && transcript?.url) {
      transcriptUrl = transcript.url;
    } else if (typeof transcript === "string") {
      transcriptText = transcript;
    }

    return {
      guid: i.guid ?? i.link ?? `${i.title}-${i.pubDate}`,
      title: i.title ?? "(untitled)",
      publishedAt: i.pubDate ? new Date(i.pubDate) : new Date(),
      audioUrl: i.enclosure?.url ?? null,
      durationSeconds: parseDuration(i["itunes:duration"]),
      transcriptText,
      transcriptUrl,
      link: i.link ?? null,
    };
  });
}

function parseDuration(input: string | undefined): number | null {
  if (!input) return null;
  if (/^\d+$/.test(input)) return Number(input);
  const parts = input.split(":").map(Number);
  if (parts.some(Number.isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}
