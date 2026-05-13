import { NextResponse } from "next/server";
import { env, hasEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/server";
import { findInvoice, verifyWebhookSignature } from "@/lib/strike";
import { captureServerEvent, distinctUserId } from "@/lib/posthog";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Strike webhook receiver.
 *
 *   - Verifies HMAC-SHA256 of the raw body against STRIKE_WEBHOOK_SECRET.
 *   - The webhook payload is just a notification ({ entityId, changes }):
 *     we re-fetch the invoice from Strike to read the authoritative state.
 *   - Marks `donations.status = paid | expired` based on Strike's state.
 *   - Idempotent: only flips rows still in `pending`.
 */

type WebhookEvent = {
  id?: string;
  eventType?: string;
  webhookVersion?: string;
  data?: { entityId?: string; changes?: string[] };
};

export async function POST(req: Request) {
  const raw = await req.text();

  if (hasEnv("STRIKE_WEBHOOK_SECRET")) {
    if (!verifyWebhookSignature(raw, req.headers)) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }
  } else if (env.NODE_ENV === "production") {
    console.error("[strike] STRIKE_WEBHOOK_SECRET missing in production");
    return NextResponse.json(
      { error: "webhook_secret_unconfigured" },
      { status: 500 },
    );
  }

  let body: WebhookEvent;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const eventType = body.eventType;
  const invoiceId = body.data?.entityId;

  if (!eventType || !invoiceId) {
    return NextResponse.json({ ok: true, ignored: "no_event" });
  }
  if (!eventType.startsWith("invoice.")) {
    return NextResponse.json({ ok: true, ignored: eventType });
  }

  if (
    !hasEnv("STRIKE_API_KEY") ||
    !hasEnv("NEXT_PUBLIC_SUPABASE_URL") ||
    !hasEnv("SUPABASE_SERVICE_ROLE_KEY")
  ) {
    // Acknowledge so Strike doesn't keep retrying — but log loudly.
    console.error("[strike] webhook fired but env not configured");
    return NextResponse.json({ ok: true, ignored: "env_missing" });
  }

  let invoice;
  try {
    invoice = await findInvoice(invoiceId);
  } catch (err) {
    console.error("[strike] findInvoice failed", err);
    return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
  }

  const db = createServiceClient();
  let updateError: { message: string } | null = null;

  if (invoice.state === "PAID") {
    const { data: paidRows, error } = await db
      .from("donations")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("strike_invoice_id", invoiceId)
      .eq("status", "pending")
      .select("id, user_id, amount_sats");
    updateError = error;
    const row = paidRows?.[0];
    if (!error && row) {
      const distinctId = row.user_id
        ? distinctUserId(row.user_id as string)
        : `anonymous_donation:${row.id as string}`;
      await captureServerEvent({
        distinctId,
        event: "donation_completed",
        properties: {
          donation_id: row.id,
          amount_sats: row.amount_sats,
          has_user_account: Boolean(row.user_id),
          $insert_id: `donation_paid_${row.id}`,
        },
      });
    }
  } else if (invoice.state === "EXPIRED" || invoice.state === "CANCELLED") {
    const { error } = await db
      .from("donations")
      .update({ status: "expired" })
      .eq("strike_invoice_id", invoiceId)
      .eq("status", "pending");
    updateError = error;
  }

  if (updateError) {
    console.error("[strike] donations update failed", updateError);
    return NextResponse.json({ error: "db_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, state: invoice.state });
}
