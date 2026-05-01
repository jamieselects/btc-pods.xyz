import { NextResponse } from "next/server";
import { listCuratedPodcasts } from "@/lib/podcasts";

export const runtime = "nodejs";

/** GET /api/podcasts — public list of active curated podcasts. */
export async function GET() {
  const podcasts = await listCuratedPodcasts();
  return NextResponse.json({ podcasts });
}
