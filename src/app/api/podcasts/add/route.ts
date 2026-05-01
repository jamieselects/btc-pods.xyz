import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fetchRss } from "@/lib/pipeline/fetchRss";

export const runtime = "nodejs";
export const maxDuration = 30;

const bodySchema = z.object({
  rss_url: z.url({ error: "Provide a valid RSS URL." }),
  name: z.string().min(2).max(120).optional(),
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * POST /api/podcasts/add — user-submitted RSS feed.
 * Validates the feed has at least one audio enclosure, then inserts a
 * non-curated podcasts row. Idempotent on rss_url via unique slug fallback.
 */
export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let items;
  try {
    items = await fetchRss(parsed.data.rss_url);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not parse feed." },
      { status: 422 },
    );
  }

  const hasAudio = items.some((i) => !!i.audioUrl);
  if (!hasAudio) {
    return NextResponse.json(
      { error: "Feed has no audio enclosures — not a podcast feed." },
      { status: 422 },
    );
  }

  const displayName =
    parsed.data.name?.trim() ||
    new URL(parsed.data.rss_url).hostname.replace(/^www\./, "");
  const slug = `${slugify(displayName)}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("podcasts")
    .insert({
      slug,
      name: displayName,
      rss_url: parsed.data.rss_url,
      is_curated: false,
      is_active: true,
      has_transcript_in_rss: items.some(
        (i) => i.transcriptText || i.transcriptUrl,
      ),
    })
    .select("id, slug, name")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ podcast: data }, { status: 201 });
}
