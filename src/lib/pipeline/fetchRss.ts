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

/** Avoid `rss-parser`’s `parseURL()` — it uses deprecated `url.parse()` (DEP0169 on Node ≥24). */
const RSS_FETCH_TIMEOUT_MS = 60_000;

/**
 * Fetch and parse an RSS feed into a normalised list of episode candidates.
 * Uses `fetch` + `parseString` so redirects and TLS are handled without Node’s legacy `url` API.
 */
export async function fetchRss(rssUrl: string): Promise<RssItem[]> {
  const res = await fetch(rssUrl, {
    headers: {
      Accept:
        "application/rss+xml, application/xml, text/xml;q=0.9, application/atom+xml;q=0.8, */*;q=0.5",
      "User-Agent":
        "btc-pod-summaries/1.0 (podcast ingest; rss-parser+xml2js)",
    },
    signal: AbortSignal.timeout(RSS_FETCH_TIMEOUT_MS),
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`RSS fetch failed (${rssUrl}): HTTP ${res.status}`);
  }
  const xml = await res.text();
  const feed = await parser.parseString(xml);

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
