/**
 * For each podcast row, fetch its RSS feed and find the newest item pubDate.
 * Podcasts whose latest RSS episode is older than STALE_DAYS (default 90)
 * are candidates for removal.
 *
 * Dry-run (print only):
 *   npx tsx scripts/audit-stale-podcasts-from-rss.ts
 *
 * After reviewing the output, delete those rows (cascades episodes, etc.):
 *   npx tsx scripts/audit-stale-podcasts-from-rss.ts --execute
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { fetchRss } from "../src/lib/pipeline/fetchRss";

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

const STALE_DAYS = Math.max(1, Number(process.env.STALE_DAYS) || 90);

type Row = {
  id: string;
  slug: string;
  name: string;
  rss_url: string;
  is_active: boolean | null;
  is_curated: boolean | null;
};

function cutoffMs(): number {
  return Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
}

async function main() {
  loadEnvLocal();

  const execute = process.argv.includes("--execute");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  const db = createClient(url, key);
  const { data: podcasts, error } = await db
    .from("podcasts")
    .select("id, slug, name, rss_url, is_active, is_curated")
    .order("slug");

  if (error || !podcasts) {
    console.error(error?.message ?? "no data");
    process.exit(1);
  }

  const cutoff = cutoffMs();
  const stale: (Row & {
    latestRssIso: string;
    rssItemCount: number;
  })[] = [];
  const fresh: { slug: string; name: string; latestRssIso: string }[] = [];
  const empty: Row[] = [];
  const failed: { row: Row; message: string }[] = [];

  for (const p of podcasts as Row[]) {
    try {
      const items = await fetchRss(p.rss_url);
      if (items.length === 0) {
        empty.push(p);
        continue;
      }
      let latest = items[0]!.publishedAt;
      for (const it of items) {
        if (it.publishedAt.getTime() > latest.getTime()) latest = it.publishedAt;
      }
      if (latest.getTime() < cutoff) {
        stale.push({
          ...p,
          latestRssIso: latest.toISOString(),
          rssItemCount: items.length,
        });
      } else {
        fresh.push({
          slug: p.slug,
          name: p.name,
          latestRssIso: latest.toISOString(),
        });
      }
    } catch (e) {
      failed.push({
        row: p,
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        staleDays: STALE_DAYS,
        cutoffIso: new Date(cutoff).toISOString(),
        nowIso: new Date().toISOString(),
        summary: {
          totalPodcasts: podcasts.length,
          staleCandidates: stale.length,
          fresh: fresh.length,
          emptyFeed: empty.length,
          fetchFailed: failed.length,
        },
        wouldDelete: stale.map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          rss_url: s.rss_url,
          is_active: s.is_active,
          is_curated: s.is_curated,
          latestEpisodeInRssIso: s.latestRssIso,
          rssItemCount: s.rssItemCount,
        })),
        emptyFeedNotAutoDeleted: empty.map((e) => ({
          id: e.id,
          slug: e.slug,
          name: e.name,
          rss_url: e.rss_url,
        })),
        fetchFailedNotAutoDeleted: failed.map((f) => ({
          id: f.row.id,
          slug: f.row.slug,
          name: f.row.name,
          rss_url: f.row.rss_url,
          error: f.message,
        })),
        freshPodcasts: fresh,
      },
      null,
      2,
    ),
  );

  if (execute) {
    if (stale.length === 0) {
      console.error("\n--execute: nothing to delete.");
      return;
    }
    const ids = stale.map((s) => s.id);
    const { error: delErr } = await db.from("podcasts").delete().in("id", ids);
    if (delErr) {
      console.error("Delete failed:", delErr.message);
      process.exit(1);
    }
    console.error(`\nDeleted ${ids.length} podcast row(s).`);
  } else {
    console.error(
      "\nDry-run only. Re-run with --execute after confirming wouldDelete.",
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
