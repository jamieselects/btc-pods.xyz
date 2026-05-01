import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/donate/create-invoice — Strike Lightning invoice creation.
 * Body: { amountSats: number, description?: string }
 * Returns: { invoiceId, paymentRequest }
 * Implemented in phase 3.
 */
export async function POST() {
  return NextResponse.json(
    { error: "not_implemented", message: "phase 3 stub (Strike donations)" },
    { status: 501 },
  );
}
