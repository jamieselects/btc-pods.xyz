/**
 * Map major podcast directory URLs (Apple Podcasts, Spotify) to a concrete
 * RSS URL we can ingest. Returns null when the URL is not a recognised pattern.
 */

const ITUNES_LOOKUP_TIMEOUT_MS = 15_000;

/** Spotifeed turns a Spotify show id into an RSS document (third‑party). */
const SPOTIFEED_BASE = "https://spotifeed.timdorr.com";

function extractApplePodcastId(href: string): string | null {
  const fromPath = href.match(/\/id(\d+)/i);
  if (fromPath?.[1]) return fromPath[1];
  const fromQuery = href.match(/[?&]i=(\d+)/i);
  if (fromQuery?.[1]) return fromQuery[1];
  const overcast = href.match(/\/itunes(\d{6,})\b/i);
  return overcast?.[1] ?? null;
}

function extractSpotifyShowId(href: string): string | null {
  try {
    const u = new URL(href);
    if (!u.hostname.endsWith("spotify.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const showIdx = parts.indexOf("show");
    if (showIdx >= 0 && parts[showIdx + 1]) {
      const id = parts[showIdx + 1];
      if (/^[a-zA-Z0-9]{10,}$/.test(id)) return id;
    }
  } catch {
    return null;
  }
  return null;
}

async function lookupApplePodcastRss(appleId: string): Promise<string | null> {
  const lookupUrl = new URL("https://itunes.apple.com/lookup");
  lookupUrl.searchParams.set("id", appleId);
  lookupUrl.searchParams.set("entity", "podcast");
  lookupUrl.searchParams.set("country", "us");

  const res = await fetch(lookupUrl.href, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(ITUNES_LOOKUP_TIMEOUT_MS),
    redirect: "follow",
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    results?: Array<{ kind?: string; feedUrl?: string }>;
  };
  const rows = data.results ?? [];
  const podcast = rows.find((r) => r.kind === "podcast" && r.feedUrl);
  const feedUrl = podcast?.feedUrl;
  if (typeof feedUrl === "string" && /^https?:\/\//i.test(feedUrl)) {
    return feedUrl;
  }
  return null;
}

/**
 * If `href` is an Apple Podcasts / iTunes show link or a Spotify show link,
 * return the canonical RSS URL to fetch. Otherwise return null.
 */
export async function resolveDirectoryUrlToRssUrl(
  href: string,
): Promise<string | null> {
  const appleId = extractApplePodcastId(href);
  if (appleId) {
    return lookupApplePodcastRss(appleId);
  }

  const spotifyShowId = extractSpotifyShowId(href);
  if (spotifyShowId) {
    return `${SPOTIFEED_BASE}/${spotifyShowId}`;
  }

  return null;
}
