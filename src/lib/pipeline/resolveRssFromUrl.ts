import Parser from "rss-parser";
import {
  fetchRssWithChannel,
  RSS_FETCH_TIMEOUT_MS,
} from "@/lib/pipeline/fetchRss";
import { resolveDirectoryUrlToRssUrl } from "@/lib/pipeline/resolvePlatformPodcastLink";

const PAGE_FETCH_TIMEOUT_MS = 20_000;

const looseParser = new Parser();

function normalizeUserInput(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function looksLikeFeedXml(snippet: string): boolean {
  const s = snippet.trimStart().slice(0, 512).toLowerCase();
  return (
    s.startsWith("<?xml") ||
    s.includes("<rss") ||
    s.includes("<feed") ||
    s.includes("xmlns=\"http://www.w3.org/2005/atom\"")
  );
}

async function tryParseAsFeed(
  canonicalUrl: string,
  xml: string,
): Promise<string | null> {
  if (!looksLikeFeedXml(xml)) return null;
  try {
    const feed = await looseParser.parseString(xml);
    if ((feed.items?.length ?? 0) > 0 || feed.title) return canonicalUrl;
  } catch {
    return null;
  }
  return null;
}

function collectAlternateFeedHrefs(html: string, baseUrl: string): string[] {
  const out: string[] = [];
  const linkTag = /<link\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = linkTag.exec(html)) !== null) {
    const tag = m[0];
    if (!/\brel\s*=\s*["']?alternate["']?/i.test(tag)) continue;
    if (
      !/\btype\s*=\s*["']application\/(rss|atom)\+xml["']/i.test(tag)
    ) {
      continue;
    }
    const hrefM = /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag);
    if (!hrefM?.[1]) continue;
    try {
      out.push(new URL(hrefM[1], baseUrl).href);
    } catch {
      /* skip invalid */
    }
  }
  return [...new Set(out)];
}

/**
 * Resolve a pasted show URL or RSS URL to a fetchable RSS/Atom document URL.
 */
export async function resolveRssUrlFromPaste(
  raw: string,
): Promise<{ rssUrl: string } | { error: string }> {
  let pageUrl: URL;
  try {
    pageUrl = new URL(normalizeUserInput(raw));
  } catch {
    return { error: "That doesn’t look like a valid URL." };
  }

  if (!["http:", "https:"].includes(pageUrl.protocol)) {
    return { error: "Only http(s) links are supported." };
  }

  const initialHref = pageUrl.href;

  const tryFeed = async (href: string) => {
    try {
      const { finalUrl } = await fetchRssWithChannel(href);
      return { rssUrl: finalUrl } as const;
    } catch {
      return null;
    }
  };

  const directoryRss = await resolveDirectoryUrlToRssUrl(initialHref);
  if (directoryRss) {
    const fromDirectory = await tryFeed(directoryRss);
    if (fromDirectory) return fromDirectory;
  }

  const direct = await (async () => {
    const res = await fetch(initialHref, {
      headers: {
        Accept:
          "application/rss+xml, application/xml, text/xml;q=0.9, application/atom+xml;q=0.8, text/html;q=0.6, */*;q=0.5",
        "User-Agent":
          "btc-pod-summaries/1.0 (podcast suggest; rss-or-html)",
      },
      signal: AbortSignal.timeout(RSS_FETCH_TIMEOUT_MS),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const xml = await res.text();
    const asFeed = await tryParseAsFeed(res.url, xml);
    if (!asFeed) return null;
    const ok = await tryFeed(res.url);
    return ok;
  })();

  if (direct) return direct;

  const htmlRes = await fetch(initialHref, {
    headers: {
      Accept: "text/html,application/xhtml+xml;q=0.9, */*;q=0.5",
      "User-Agent":
        "btc-pod-summaries/1.0 (podcast suggest; rss-or-html)",
    },
    signal: AbortSignal.timeout(PAGE_FETCH_TIMEOUT_MS),
    redirect: "follow",
  });
  if (!htmlRes.ok) {
    return {
      error:
        "Couldn’t load that page or read it as a podcast feed. Paste the show’s RSS URL, or a page that includes a feed link (link rel=alternate type=application/rss+xml).",
    };
  }
  const html = await htmlRes.text();
  const base = htmlRes.url;
  const candidates = collectAlternateFeedHrefs(html, base);
  for (const href of candidates) {
    const ok = await tryFeed(href);
    if (ok) return ok;
  }

  return {
    error:
      "No usable RSS or Atom feed was found. Open the show’s website or host page, copy its RSS feed URL, and paste that here.",
  };
}
