import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Strike for Business API client.
 *
 * Flow for donations (per docs.strike.me/walkthrough/receiving-payments):
 *   1. POST /v1/invoices       — create a BTC-denominated invoice.
 *   2. POST /v1/invoices/:id/quote — mint a Lightning quote (BOLT11).
 *   3. Display lnInvoice as QR / copy text.
 *   4. Strike fires `invoice.updated` webhook on state change.
 *   5. Re-fetch GET /v1/invoices/:id for the authoritative state.
 */

const STRIKE_API_BASE = "https://api.strike.me";

export type StrikeInvoiceState =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "EXPIRED"
  | "CANCELLED";

export type StrikeInvoice = {
  invoiceId: string;
  paymentRequest: string;
  state: StrikeInvoiceState;
  expiresAt: string | null;
};

export type StrikeRawInvoice = {
  invoiceId: string;
  state: StrikeInvoiceState;
  amount: { amount: string; currency: string };
  description?: string;
  correlationId?: string;
  created: string;
};

type StrikeQuote = {
  quoteId: string;
  lnInvoice: string;
  expiration: string;
  expirationInSec: number;
};

export async function createInvoice(opts: {
  amountSats: number;
  description: string;
  correlationId?: string;
}): Promise<StrikeInvoice> {
  if (!env.STRIKE_API_KEY) {
    throw new Error("STRIKE_API_KEY is not set.");
  }
  if (!Number.isInteger(opts.amountSats) || opts.amountSats <= 0) {
    throw new Error("amountSats must be a positive integer.");
  }

  const btcAmount = (opts.amountSats / 1e8).toFixed(8);

  const inv = await strikeFetch<StrikeRawInvoice>("/v1/invoices", {
    method: "POST",
    body: JSON.stringify({
      correlationId: opts.correlationId,
      description: opts.description.slice(0, 200),
      amount: { currency: "BTC", amount: btcAmount },
    }),
  });

  const quote = await strikeFetch<StrikeQuote>(
    `/v1/invoices/${inv.invoiceId}/quote`,
    { method: "POST" },
  );

  return {
    invoiceId: inv.invoiceId,
    paymentRequest: quote.lnInvoice,
    state: inv.state,
    expiresAt: quote.expiration ?? null,
  };
}

export async function findInvoice(invoiceId: string): Promise<StrikeRawInvoice> {
  if (!env.STRIKE_API_KEY) {
    throw new Error("STRIKE_API_KEY is not set.");
  }
  return strikeFetch<StrikeRawInvoice>(`/v1/invoices/${invoiceId}`, {
    method: "GET",
  });
}

async function strikeFetch<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${STRIKE_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.STRIKE_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(20_000),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Strike ${path} HTTP ${res.status}: ${text.slice(0, 500)}`);
  }
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

/**
 * Verify the HMAC-SHA256 signature on a Strike webhook request.
 *
 * Strike's webhook subscription stores a `secret` (10–50 chars) which they
 * use to sign the raw request body. The exact header name isn't documented
 * publicly, so we accept the common variants and timing-safe-compare each.
 *
 * The webhook event itself is just a notification — callers should still
 * re-fetch the invoice via `findInvoice()` for authoritative state.
 */
export function verifyWebhookSignature(
  rawBody: string,
  headers: Headers,
): boolean {
  if (!env.STRIKE_WEBHOOK_SECRET) return false;

  const expected = createHmac("sha256", env.STRIKE_WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("hex");

  const candidateHeaders = [
    "x-webhook-signature",
    "x-hmac-signature",
    "x-hmac-sha256-signature",
    "strike-signature",
    "x-strike-signature",
  ];

  for (const name of candidateHeaders) {
    const provided = headers.get(name);
    if (!provided) continue;
    const cleaned = provided.replace(/^sha256=/i, "").trim().toLowerCase();
    if (cleaned.length !== expected.length) continue;
    try {
      if (
        timingSafeEqual(
          Buffer.from(cleaned, "hex"),
          Buffer.from(expected, "hex"),
        )
      ) {
        return true;
      }
    } catch {
      // Fall through — malformed hex shouldn't crash the verifier.
    }
  }
  return false;
}
