import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/donate/webhook — Strike webhook receiver.
 * Verifies HMAC-SHA256 signature against STRIKE_WEBHOOK_SECRET,
 * marks donations row as paid on `invoice.updated` + state PAID.
 * Implemented in phase 3.
 */
export async function POST() {
  return NextResponse.json(
    { error: "not_implemented", message: "phase 3 stub (Strike webhook)" },
    { status: 501 },
  );
}
