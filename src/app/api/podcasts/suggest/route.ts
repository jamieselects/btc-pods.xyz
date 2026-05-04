import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchRssWithChannel, type RssItem } from "@/lib/pipeline/fetchRss";
import { resolveRssUrlFromPaste } from "@/lib/pipeline/resolveRssFromUrl";
import { hasEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  url: z.string().min(4).max(2048),
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sameUrl(a: string, b: string): boolean {
  try {
    return new URL(a).href === new URL(b).href;
  } catch {
    return false;
  }
}

function safeHttpUrl(s: string | null | undefined): string | null {
  if (!s?.trim()) return null;
  try {
    const u = new URL(s.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.href;
  } catch {
    return null;
  }
}

function isSpotifeedRssUrl(url: string): boolean {
  try {
    return new URL(url).hostname === "spotifeed.timdorr.com";
  } catch {
    return false;
  }
}

/**
 * Normal RSS needs an audio enclosure. Spotify proxy feeds (Spotifeed) omit
 * enclosures but include episode links + duration — enough to treat as a podcast feed.
 */
function feedHasPlayableEpisodes(
  items: RssItem[],
  rssCanonical: string,
): boolean {
  if (items.some((i) => !!i.audioUrl)) return true;
  if (!isSpotifeedRssUrl(rssCanonical)) return false;
  return items.some(
    (i) =>
      (typeof i.durationSeconds === "number" && i.durationSeconds > 0) ||
      Boolean(i.link?.includes("open.spotify.com/episode")),
  );
}

/**
 * POST /api/podcasts/suggest — resolve a pasted show or RSS URL, validate
 * audio enclosures, then insert a curated catalog row (service role).
 */
export async function POST(req: Request) {
  if (!hasEnv("NEXT_PUBLIC_SUPABASE_URL") || !hasEnv("SUPABASE_SERVICE_ROLE_KEY")) {
    return NextResponse.json(
      { error: "Podcast suggestions are not configured yet." },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .find((m): m is string => typeof m === "string");
    return NextResponse.json(
      { error: first ?? "Invalid request." },
      { status: 400 },
    );
  }

  const pasted = parsed.data.url.trim();
  let pastedCanonical: string;
  try {
    pastedCanonical = /^https?:\/\//i.test(pasted)
      ? new URL(pasted).href
      : new URL(`https://${pasted}`).href;
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  const resolved = await resolveRssUrlFromPaste(pasted);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 422 });
  }

  let loaded;
  try {
    loaded = await fetchRssWithChannel(resolved.rssUrl);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not read the podcast feed.",
      },
      { status: 422 },
    );
  }

  const { items, channel, finalUrl: rssCanonical } = loaded;
  if (!feedHasPlayableEpisodes(items, rssCanonical)) {
    return NextResponse.json(
      {
        error:
          "That feed has no usable episodes (no audio enclosures). For Spotify-only shows, paste the open.spotify.com/show/… link.",
      },
      { status: 422 },
    );
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("podcasts")
    .select("id, slug, name")
    .eq("rss_url", rssCanonical)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        alreadyExisted: true,
        podcast: {
          id: existing.id,
          slug: existing.slug,
          name: existing.name,
        },
      },
      { status: 200 },
    );
  }

  const rawName = channel.title?.trim() || "Untitled podcast";
  const name = rawName.length > 120 ? `${rawName.slice(0, 117)}…` : rawName;
  const plainDesc = channel.description
    ? stripTags(channel.description).slice(0, 8000)
    : null;
  const tagline =
    plainDesc && plainDesc.length > 0
      ? plainDesc.length > 180
        ? `${plainDesc.slice(0, 177)}…`
        : plainDesc
      : null;

  const websiteUrl = sameUrl(pastedCanonical, rssCanonical)
    ? safeHttpUrl(channel.link)
    : safeHttpUrl(pastedCanonical);

  const slug = `${slugify(name)}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("podcasts")
    .insert({
      slug,
      name,
      tagline,
      description: plainDesc,
      rss_url: rssCanonical,
      website_url: websiteUrl,
      cover_image_url: safeHttpUrl(channel.imageUrl),
      has_transcript_in_rss: items.some(
        (i) => i.transcriptText || i.transcriptUrl,
      ),
      is_curated: true,
      is_active: true,
    })
    .select("id, slug, name")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ podcast: data, alreadyExisted: false }, { status: 201 });
}
