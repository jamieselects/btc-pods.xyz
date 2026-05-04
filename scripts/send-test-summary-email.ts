/**
 * One-off: send the latest stored WBD summary to a test inbox.
 *
 * Usage:
 *   npx tsx scripts/send-test-summary-email.ts [to@email.com] [appBaseUrl]
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * RESEND_API_KEY, RESEND_FROM_EMAIL.
 */
import { loadEnvConfig } from "@next/env";

// `true` loads `.env.local` the same way as `next dev` (needed when NODE_ENV is production).
loadEnvConfig(process.cwd(), true);

const TEST_EMAIL = process.argv[2] ?? "jamie@jamieselects.com";
const APP_BASE =
  process.argv[3] ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://btcpods.xyz";

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const { sendDigest } = await import("../src/lib/pipeline/sendDigest");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const db = createClient(url, key);

  const { data: row, error } = await db
    .from("episodes")
    .select(
      `
      id,
      title,
      published_at,
      source_link,
      podcasts!inner ( name, slug ),
      summaries!inner ( id, key_topics, market_signals, actionable_insights, sponsorships )
    `,
    )
    .eq("podcasts.slug", "what-bitcoin-did")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }
  if (!row) {
    console.error(
      "No episode with a summary found for slug what-bitcoin-did. Run the cron pipeline or ingest first.",
    );
    process.exit(1);
  }

  const podcast = row.podcasts as unknown as { name: string; slug: string };
  const raw = row.summaries as unknown;
  const summaries = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const summary = summaries[0] as
    | {
        id: string;
        key_topics: string | null;
        market_signals: string | null;
        actionable_insights: string | null;
        sponsorships: string | null;
      }
    | undefined;
  if (!summary) {
    console.error("Episode row had no summary payload.", raw);
    process.exit(1);
  }

  const report = await sendDigest({
    recipients: [
      {
        userId: "00000000-0000-0000-0000-000000000001",
        email: TEST_EMAIL,
      },
    ],
    summaryId: null,
    db: null,
    payload: {
      podcastName: podcast.name,
      episodeTitle: row.title,
      episodeUrl: `${APP_BASE.replace(/\/$/, "")}/episodes/${row.id}`,
      listenUrl:
        typeof row.source_link === "string" && row.source_link.trim()
          ? row.source_link.trim()
          : null,
      keyTopics: summary.key_topics ?? "",
      marketSignals: summary.market_signals ?? "",
      actionableInsights: summary.actionable_insights ?? "",
      sponsorships: summary.sponsorships ?? "",
    },
  });

  console.log("sendDigest report:", JSON.stringify(report, null, 2));
  if (report.failed > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
