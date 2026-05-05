/**
 * Re-run Claude summarization for an existing episode using its stored transcript.
 * Updates the `summaries` row in place (or inserts one if missing).
 *
 * Prereqs: `.env.local` with `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
 * `SUPABASE_SERVICE_ROLE_KEY`.
 *
 *   npm run resummarize:episode -- <episode-uuid>
 *   EPISODE_ID=<uuid> npm run resummarize:episode
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

/** Same cap as the cron pipeline (Claude context budget). */
const TRANSCRIPT_CHAR_CAP = 80_000;

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function main() {
  loadEnvLocal();

  const arg = process.argv[2]?.trim();
  const episodeId = (process.env.EPISODE_ID?.trim() || arg) ?? "";
  if (!episodeId || !UUID_RE.test(episodeId)) {
    console.error(
      "Usage: EPISODE_ID=<uuid> npm run resummarize:episode\n   or: npm run resummarize:episode -- <episode-uuid>",
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    console.error("Missing ANTHROPIC_API_KEY");
    process.exit(1);
  }

  const db = createClient(url, key);

  const { data: episode, error: epErr } = await db
    .from("episodes")
    .select("id, title, transcript, podcast:podcasts(name, slug)")
    .eq("id", episodeId)
    .maybeSingle();

  if (epErr) {
    console.error(epErr.message);
    process.exit(1);
  }
  if (!episode) {
    console.error(`No episode with id ${episodeId}`);
    process.exit(1);
  }

  const transcript = (episode.transcript as string | null)?.trim() ?? "";
  if (!transcript) {
    console.error(
      "Episode has no stored transcript. Ingest/transcribe it first (cron pipeline).",
    );
    process.exit(1);
  }

  const cleaned = transcript.slice(0, TRANSCRIPT_CHAR_CAP);
  const podcast = episode.podcast as { name?: string; slug?: string } | null;

  console.log(
    `Re-summarising: ${(episode.title as string)?.slice(0, 72) ?? episodeId}`,
  );
  if (podcast?.slug) console.log(`  Podcast: ${podcast.name} (${podcast.slug})`);

  const { summarise } = await import("../src/lib/pipeline/summarise");
  const summary = await summarise(cleaned);

  const { data: existing } = await db
    .from("summaries")
    .select("id")
    .eq("episode_id", episodeId)
    .maybeSingle();

  const payload = {
    key_topics: summary.keyTopics,
    market_signals: summary.marketSignals,
    actionable_insights: summary.actionableInsights,
    sponsorships: summary.sponsorships,
    full_summary_md: summary.fullSummaryMd,
    model_used: summary.modelUsed,
    input_tokens: summary.inputTokens,
    output_tokens: summary.outputTokens,
  };

  if (existing?.id) {
    const { error: upErr } = await db
      .from("summaries")
      .update(payload)
      .eq("id", existing.id);
    if (upErr) {
      console.error("Update failed:", upErr.message);
      process.exit(1);
    }
    console.log(`Updated summary row ${existing.id}`);
  } else {
    const { data: inserted, error: inErr } = await db
      .from("summaries")
      .insert({ episode_id: episodeId, ...payload })
      .select("id")
      .single();
    if (inErr) {
      console.error("Insert failed:", inErr.message);
      process.exit(1);
    }
    console.log(`Inserted summary row ${inserted?.id}`);
  }

  console.log(
    `Done. Tokens in/out: ${summary.inputTokens} / ${summary.outputTokens} (${summary.modelUsed})`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
