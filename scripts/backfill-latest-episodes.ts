/**
 * Backfill the latest N episodes (summaries + optional digests) for curated
 * podcasts by slug. Uses the same pipeline as cron (processPodcast).
 *
 * Prereqs: `.env.local` with Supabase service role, Strike optional, and LLM
 * keys used by summarise/transcript resolution.
 *
 *   npx tsx scripts/backfill-latest-episodes.ts
 *
 * Override defaults:
 *   SLUGS=the-bitcoin-layer,coin-stories LOOKBACK_DAYS=400 MAX_PER_RUN=3 npx tsx scripts/backfill-latest-episodes.ts
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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

const DEFAULT_SLUGS = [
  "the-bitcoin-layer",
  "presidio-bitcoin",
  "coin-stories",
  "the-pomp-podcast",
];

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const slugs = (process.env.SLUGS?.split(",").map((s) => s.trim()) ?? DEFAULT_SLUGS).filter(
    Boolean,
  );
  const lookbackDays = Number(process.env.LOOKBACK_DAYS) || 400;
  const maxPerRun = Number(process.env.MAX_PER_RUN) || 3;
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const { processPodcast } = await import("../src/lib/pipeline/processPodcast.ts");
  const db = createClient(url, key);

  for (const slug of slugs) {
    const { data: podcast, error } = await db
      .from("podcasts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      console.error(slug, error.message);
      continue;
    }
    if (!podcast) {
      console.error(`No podcast row for slug: ${slug}`);
      continue;
    }
    console.log(`\n→ ${slug} (${podcast.name}) …`);
    const report = await processPodcast(podcast, db, appBaseUrl, {
      lookbackDays,
      maxEpisodesPerRun: maxPerRun,
      recipientsOverride: [],
    });
    if (report.error) console.error("  error:", report.error);
    console.log(
      "  processed:",
      report.processedCount,
      report.episodes.map((e) => `${e.status} ${e.title.slice(0, 48)}`),
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
