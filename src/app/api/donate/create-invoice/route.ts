import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env, hasEnv } from "@/lib/env";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createInvoice } from "@/lib/strike";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Bounds intentionally generous — Strike will reject invoices that exceed
 * the BTC business-account limits with its own error.
 *
 *   100 sats     ≈ $0.05 floor (covers Lightning routing fees)
 *   10_000_000   ≈ 0.1 BTC ceiling (sanity, not policy)
 */
const bodySchema = z.object({
  amountSats: z.number().int().min(100).max(10_000_000),
  description: z.string().max(160).optional(),
});

export async function POST(req: Request) {
  if (!hasEnv("STRIKE_API_KEY")) {
    return NextResponse.json(
      { error: "donations_unavailable" },
      { status: 503 },
    );
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

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Anonymous donations are allowed; tie the row to a user when one exists.
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
  }

  const description =
    parsed.data.description?.trim() || "BTC Pod Summaries donation";

  let invoice;
  try {
    invoice = await createInvoice({
      amountSats: parsed.data.amountSats,
      description,
      correlationId: randomUUID(),
    });
  } catch (err) {
    if (env.NODE_ENV !== "production") {
      console.error("[strike] createInvoice failed", err);
    }
    return NextResponse.json(
      {
        error: "strike_failed",
        detail: err instanceof Error ? err.message : "unknown error",
      },
      { status: 502 },
    );
  }

  const db = createServiceClient();
  const { data: row, error } = await db
    .from("donations")
    .insert({
      user_id: userId,
      strike_invoice_id: invoice.invoiceId,
      amount_sats: parsed.data.amountSats,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("[strike] donation insert failed", error);
    return NextResponse.json({ error: "db_failed" }, { status: 500 });
  }

  return NextResponse.json({
    donationId: row.id,
    invoiceId: invoice.invoiceId,
    paymentRequest: invoice.paymentRequest,
    expiresAt: invoice.expiresAt,
    amountSats: parsed.data.amountSats,
  });
}
