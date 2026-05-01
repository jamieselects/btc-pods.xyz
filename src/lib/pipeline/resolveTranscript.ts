import type { RssItem } from "@/lib/pipeline/fetchRss";

export type ResolvedTranscript =
  | { source: "rss"; text: string }
  | { source: "whisper"; text: string }
  | { source: "missing"; reason: string };

const MIN_CHARS = 200;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB cap on remote transcript downloads.

/**
 * Resolve a transcript for an episode in priority order:
 *   1. Inline RSS `<podcast:transcript>` text.
 *   2. RSS-linked transcript URL (download, strip subtitle timing / HTML).
 *   3. Whisper API transcription of the audio file (phase 3).
 *
 * Returns `{ source: "missing" }` with a reason rather than throwing, so
 * the cron loop can skip this episode and keep processing others.
 */
export async function resolveTranscript(
  item: RssItem,
): Promise<ResolvedTranscript> {
  if (item.transcriptText && item.transcriptText.trim().length >= MIN_CHARS) {
    return { source: "rss", text: clean(item.transcriptText) };
  }

  if (item.transcriptUrl) {
    try {
      const text = await fetchTranscriptUrl(item.transcriptUrl);
      if (text && text.length >= MIN_CHARS) {
        return { source: "rss", text };
      }
      return {
        source: "missing",
        reason: `linked transcript too short (${text?.length ?? 0} chars)`,
      };
    } catch (err) {
      return {
        source: "missing",
        reason:
          err instanceof Error
            ? `transcript fetch failed: ${err.message}`
            : "transcript fetch failed",
      };
    }
  }

  // Phase 3 will call Whisper on item.audioUrl here.
  return {
    source: "missing",
    reason: "no RSS transcript; Whisper fallback not enabled until phase 3",
  };
}

async function fetchTranscriptUrl(url: string): Promise<string | null> {
  const res = await fetch(url, {
    headers: { accept: "text/vtt,text/plain,text/html,application/srt,*/*;q=0.5" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error(`transcript too large (${buffer.byteLength} bytes)`);
  }
  const raw = new TextDecoder("utf-8").decode(buffer);

  const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("vtt") || /^WEBVTT/m.test(raw)) {
    return clean(parseVtt(raw));
  }
  if (
    contentType.includes("srt") ||
    url.toLowerCase().endsWith(".srt") ||
    /^\d+\s*\n\d{2}:\d{2}:\d{2}/m.test(raw)
  ) {
    return clean(parseSrt(raw));
  }
  if (contentType.includes("html") || /<\/?[a-z][\s\S]*>/i.test(raw)) {
    return clean(stripHtml(raw));
  }
  return clean(raw);
}

/** Parse WebVTT: drop WEBVTT header, cue numbers, timestamps, and settings. */
export function parseVtt(raw: string): string {
  const withoutBom = raw.replace(/^\uFEFF/, "");
  const lines = withoutBom.split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^WEBVTT/.test(line)) continue;
    if (/^\d{2}:\d{2}/.test(line)) continue;
    if (/-->/.test(line)) continue;
    if (/^NOTE /.test(line)) continue;
    if (/^STYLE$/.test(line)) continue;
    if (/^\d+$/.test(line.trim())) continue;
    out.push(line.replace(/<[^>]+>/g, "").trim());
  }
  return out.join(" ");
}

/** Parse SRT: strip cue numbers and timestamp lines. */
export function parseSrt(raw: string): string {
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^\d+$/.test(line.trim())) continue;
    if (/^\d{2}:\d{2}:\d{2}/.test(line)) continue;
    out.push(line.replace(/<[^>]+>/g, "").trim());
  }
  return out.join(" ");
}

/** Very loose HTML-to-text for transcript pages. */
export function stripHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|li|br|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
