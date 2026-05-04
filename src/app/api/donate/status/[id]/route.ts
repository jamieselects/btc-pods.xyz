import { NextResponse } from "next/server";
import { z } from "zod";
import { hasEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 10;

/**
 * GET /api/donate/status/[id] — client polling endpoint for the donate modal.
 *
 * The donation id is a UUID generated server-side and only known to the
 * browser that just created the invoice, so it's effectively a bearer token.
 * We use the service-role client to bypass RLS and return only `status` —
 * never PII or amount.
 */

const idSchema = z.string().uuid();

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  if (
    !hasEnv("NEXT_PUBLIC_SUPABASE_URL") ||
    !hasEnv("SUPABASE_SERVICE_ROLE_KEY")
  ) {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 503 },
    );
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("donations")
    .select("status")
    .eq("id", parsed.data)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "db_failed" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(
    { status: data.status as "pending" | "paid" | "expired" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
