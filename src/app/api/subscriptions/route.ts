import { NextResponse } from "next/server";
import { toggleSubscription } from "@/app/actions/subscriptions";

export const runtime = "nodejs";

async function readPodcastId(req: Request): Promise<string | null> {
  try {
    const body = (await req.json()) as { podcast_id?: unknown };
    const id = body?.podcast_id;
    return typeof id === "string" && id.length > 0 ? id : null;
  } catch {
    const url = new URL(req.url);
    const id = url.searchParams.get("podcast_id");
    return id && id.length > 0 ? id : null;
  }
}

/** POST /api/subscriptions — subscribe current user to { podcast_id }. */
export async function POST(req: Request) {
  const id = await readPodcastId(req);
  if (!id) {
    return NextResponse.json({ error: "podcast_id required" }, { status: 400 });
  }
  const result = await toggleSubscription(id, true);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({ ok: true, subscribed: true });
}

/** DELETE /api/subscriptions — unsubscribe current user from { podcast_id }. */
export async function DELETE(req: Request) {
  const id = await readPodcastId(req);
  if (!id) {
    return NextResponse.json({ error: "podcast_id required" }, { status: 400 });
  }
  const result = await toggleSubscription(id, false);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({ ok: true, subscribed: false });
}
