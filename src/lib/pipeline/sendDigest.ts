import { createElement } from "react";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { env } from "@/lib/env";
import { EpisodeSummary } from "@/emails/EpisodeSummary";
import type { DeliveryStatus } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type DigestPayload = {
  podcastName: string;
  episodeTitle: string;
  episodeUrl: string;
  keyTopics: string;
  marketSignals: string;
  actionableInsights: string;
  sponsorships: string;
};

export type Recipient = {
  userId: string;
  email: string;
};

export type DeliveryReport = {
  sent: number;
  failed: number;
  perRecipient: Array<{
    userId: string;
    status: DeliveryStatus;
    resendId: string | null;
  }>;
};

/**
 * Send an episode digest to every subscriber and (if given a Supabase client)
 * write per-recipient rows into `delivery_log`.
 *
 * Safe to call with recipients=[] — returns zeroed stats without hitting
 * Resend. Errors on one recipient don't abort the rest of the batch.
 */
export async function sendDigest({
  recipients,
  payload,
  summaryId,
  db,
}: {
  recipients: Recipient[];
  payload: DigestPayload;
  summaryId: string | null;
  db: SupabaseClient | null;
}): Promise<DeliveryReport> {
  const report: DeliveryReport = { sent: 0, failed: 0, perRecipient: [] };
  if (recipients.length === 0) return report;

  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set.");
  if (!env.RESEND_FROM_EMAIL) throw new Error("RESEND_FROM_EMAIL is not set.");

  const resend = new Resend(env.RESEND_API_KEY);

  const emailElement = createElement(EpisodeSummary, payload);
  const html = await render(emailElement);
  const text = await render(emailElement, { plainText: true });
  const subject = `${payload.podcastName} — ${payload.episodeTitle}`;

  for (const r of recipients) {
    let status: DeliveryStatus = "failed";
    let resendId: string | null = null;

    try {
      const result = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: r.email,
        subject,
        html,
        text,
      });
      if (result.error) {
        status = "failed";
      } else {
        status = "sent";
        resendId = result.data?.id ?? null;
        report.sent++;
      }
    } catch {
      status = "failed";
    }

    if (status === "failed") report.failed++;

    report.perRecipient.push({ userId: r.userId, status, resendId });

    if (db && summaryId) {
      await db
        .from("delivery_log")
        .insert({
          user_id: r.userId,
          summary_id: summaryId,
          email_address: r.email,
          status,
          resend_id: resendId,
        })
        .then(() => undefined);
    }
  }

  return report;
}
