/**
 * OPTIONAL: writes static one-cron-per-show `vercel.json` entries.
 *
 * Production uses `/api/cron/dispatch-podcasts` instead (reads active podcasts
 * from the DB — no regen when rows change). Run this only if you prefer static
 * cron paths over the dispatcher.
 *
 * Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and
 * `SUPABASE_SERVICE_ROLE_KEY` (same as backfill).
 *
 *   npm run generate:crons
 */

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  DISPATCH_CRON_PERIOD_MINUTES,
  DISPATCH_SLOTS_PER_DAY,
  slotIndexForPodcastIndex,
} from "../src/lib/cron/dispatchSchedule";

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

/** Same 5-minute slot → clock time as `dispatch-podcasts` runtime scheduler. */
function dailyCronUtcAlignedWithDispatch(index: number, total: number): string {
  const slot = slotIndexForPodcastIndex(index, total);
  const minuteOfDay = slot * DISPATCH_CRON_PERIOD_MINUTES;
  const hour = Math.floor(minuteOfDay / 60) % 24;
  const minute = minuteOfDay % 60;
  return `${minute} ${hour} * * *`;
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (use .env.local)",
    );
    process.exit(1);
  }

  const db = createClient(url, key);
  const { data, error } = await db
    .from("podcasts")
    .select("id, slug")
    .eq("is_active", true);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  const rows = [...(data ?? [])].sort((a, b) =>
    (a.id as string).localeCompare(b.id as string, "en"),
  );

  if (rows.length === 0) {
    console.error("No active podcasts found.");
    process.exit(1);
  }

  if (rows.length > 100) {
    console.error(
      `Too many active podcasts (${rows.length}). Vercel allows 100 crons per project — split or use dispatch mode.`,
    );
    process.exit(1);
  }

  if (rows.length > DISPATCH_SLOTS_PER_DAY) {
    console.error(
      `Too many podcasts (${rows.length}) for aligned slot formula (max ${DISPATCH_SLOTS_PER_DAY}).`,
    );
    process.exit(1);
  }

  const crons = rows.map((row, i) => ({
    path: `/api/cron/process-episodes/${encodeURIComponent(row.slug as string)}`,
    schedule: dailyCronUtcAlignedWithDispatch(i, rows.length),
  }));

  const vercelJson = {
    $schema: "https://openapi.vercel.sh/vercel.json",
    crons,
  };

  const outPath = resolve(process.cwd(), "vercel.json");
  writeFileSync(outPath, `${JSON.stringify(vercelJson, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${crons.length} cron job(s) to vercel.json (UTC, once per day each, staggered).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
