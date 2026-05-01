import { env } from "@/lib/env";

/**
 * Strike for Business API client. Phase 3 implements real calls;
 * for now this exports the typed surface used by donate routes.
 */

export type StrikeInvoice = {
  invoiceId: string;
  paymentRequest: string; // BOLT11 Lightning invoice
  state: "PENDING" | "PAID" | "EXPIRED" | "UNPAID" | "CANCELLED";
};

const STRIKE_API_BASE = "https://api.strike.me";

/**
 * Create a Lightning invoice for `amountSats`.
 * See https://docs.strike.me/api for full request/response shape.
 */
export async function createInvoice(
  amountSats: number,
  description: string,
): Promise<StrikeInvoice> {
  if (!env.STRIKE_API_KEY) {
    throw new Error("STRIKE_API_KEY is not set — phase 3 dependency.");
  }

  // TODO(phase 3): implement per spec §8.3
  //   1. POST /v1/invoices with { amount: { currency: 'BTC', amount } }
  //   2. POST /v1/invoices/:id/quote to mint a Lightning quote
  //   3. Return { invoiceId, paymentRequest: quote.lnInvoice, state: invoice.state }
  throw new Error("Strike createInvoice not implemented (phase 3).");
}

/** Verifies the HMAC-SHA256 signature on a Strike webhook payload. */
export function verifyWebhookSignature(
  _rawBody: string,
  _signatureHeader: string | null,
): boolean {
  // TODO(phase 3): HMAC-SHA256 with STRIKE_WEBHOOK_SECRET, constant-time compare.
  return false;
}
