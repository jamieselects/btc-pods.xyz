import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchRss, type RssItem } from "@/lib/pipeline/fetchRss";
import { resolveTranscript } from "@/lib/pipeline/resolveTranscript";
import { summarise } from "@/lib/pipeline/summarise";
import { sendDigest } from "@/lib/pipeline/sendDigest";
import {
  distinctUserId,
  estimateHaikuCostUsd,
  estimateWhisperCostUsd,
  getPostHogServer,
} from "@/lib/posthog";
import type { PodcastRow } from "@/lib/supabase/types";

export type EpisodeProcessResult = {
  guid: string;
  title: string;
  status:
    | "skipped_duplicate"
    | "skipped_no_transcript"
    | "summarised"
    | "error";
  error?: string;
  sent?: number;
  failed?: number;
  costUsd?: number;
};

export type PodcastProcessReport = {
  podcastId: string;
  slug: string;
  processedCount: number;
  episodes: EpisodeProcessResult[];
  error?: string;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_LOOKBACK_DAYS = 7;
const DEFAULT_MAX_EPISODES_PER_RUN = 3;
/** Claude Haiku's context window is ~200K tokens; we keep well under that. */
const TRANSCRIPT_CHAR_CAP = 80_000;

export type ProcessPodcastOptions = {
  /** Only consider RSS items published within the last N days. */
  lookbackDays?: number;
  /** Cap new episodes summarised per podcast per run. */
  maxEpisodesPerRun?: number;
  /** Override "now" for deterministic tests. */
  now?: Date;
  /** Override the email recipient list (useful for dry runs). */
  recipientsOverride?: Array<{ userId: string; email: string }>;
};

/**
 * End-to-end flow for one podcast:
 *   RSS → dedupe against episodes.guid → transcript → summary →
 *   persist → email subscribers → log delivery → PostHog cost event.
 *
 * Idempotent: the (podcast_id, guid) unique constraint makes re-runs safe.
 */
export async function processPodcast(
  podcast: PodcastRow,
  db: SupabaseClient,
  appBaseUrl: string,
  opts: ProcessPodcastOptions = {},
): Promise<PodcastProcessReport> {
  const now = opts.now ?? new Date();
  const lookbackDays = opts.lookbackDays ?? DEFAULT_LOOKBACK_DAYS;
  const cutoff = now.getTime() - lookbackDays * ONE_DAY_MS;
  const maxPerRun = opts.maxEpisodesPerRun ?? DEFAULT_MAX_EPISODES_PER_RUN;

  const report: PodcastProcessReport = {
    podcastId: podcast.id,
    slug: podcast.slug,
    processedCount: 0,
    episodes: [],
  };

  let items: RssItem[];
  try {
    items = await fetchRss(podcast.rss_url);
  } catch (err) {
    report.error = err instanceof Error ? err.message : "fetchRss failed";
    return report;
  }

  const fresh = items
    .filter((i) => i.publishedAt.getTime() >= cutoff)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, maxPerRun);
  if (fresh.length === 0) return report;

  const guids = fresh.map((i) => i.guid);
  const { data: existing } = await db
    .from("episodes")
    .select("guid")
    .eq("podcast_id", podcast.id)
    .in("guid", guids);
  const seen = new Set((existing ?? []).map((r) => r.guid as string));

  const newItems = fresh.filter((i) => !seen.has(i.guid));

  const recipients =
    opts.recipientsOverride ?? (await loadRecipients(db, podcast.id));

  for (const item of newItems) {
    report.episodes.push(
      await processEpisode(item, podcast, db, appBaseUrl, recipients),
    );
    report.processedCount++;
  }

  return report;
}

async function processEpisode(
  item: RssItem,
  podcast: PodcastRow,
  db: SupabaseClient,
  appBaseUrl: string,
  recipients: Array<{ userId: string; email: string }>,
): Promise<EpisodeProcessResult> {
  const base: Omit<EpisodeProcessResult, "status"> = {
    guid: item.guid,
    title: item.title,
  };

  try {
    const transcript = await resolveTranscript(item);
    if (transcript.source === "missing") {
      return {
        ...base,
        status: "skipped_no_transcript",
        error: transcript.reason,
      };
    }

    const cleaned = transcript.text.slice(0, TRANSCRIPT_CHAR_CAP);
    const summary = await summarise(cleaned);

    // Whisper returns ground-truth duration; prefer it over the RSS-declared value.
    const durationSeconds =
      transcript.source === "whisper"
        ? Math.round(transcript.durationSeconds)
        : item.durationSeconds;

    const { data: episodeRow, error: episodeError } = await db
      .from("episodes")
      .insert({
        podcast_id: podcast.id,
        guid: item.guid,
        title: item.title,
        published_at: item.publishedAt.toISOString(),
        audio_url: item.audioUrl,
        source_link: item.link,
        duration_seconds: durationSeconds,
        transcript: cleaned,
        transcript_source: transcript.source,
      })
      .select("id")
      .single();

    if (episodeError || !episodeRow) {
      // Unique-constraint race: another run inserted the same guid first.
      if (episodeError?.code === "23505") {
        return { ...base, status: "skipped_duplicate" };
      }
      return {
        ...base,
        status: "error",
        error: episodeError?.message ?? "episode insert failed",
      };
    }

    const { data: summaryRow, error: summaryError } = await db
      .from("summaries")
      .insert({
        episode_id: episodeRow.id,
        key_topics: summary.keyTopics,
        market_signals: summary.marketSignals,
        actionable_insights: summary.actionableInsights,
        sponsorships: summary.sponsorships,
        full_summary_md: summary.fullSummaryMd,
        model_used: summary.modelUsed,
        input_tokens: summary.inputTokens,
        output_tokens: summary.outputTokens,
      })
      .select("id")
      .single();

    if (summaryError || !summaryRow) {
      return {
        ...base,
        status: "error",
        error: summaryError?.message ?? "summary insert failed",
      };
    }

    const costUsd = estimateHaikuCostUsd(
      summary.inputTokens,
      summary.outputTokens,
    );
    const whisperCostUsd =
      transcript.source === "whisper" && durationSeconds
        ? estimateWhisperCostUsd(durationSeconds)
        : 0;
    const totalCostUsd = costUsd + whisperCostUsd;

    const posthog = getPostHogServer();
    if (posthog) {
      if (transcript.source === "whisper") {
        posthog.capture({
          distinctId: `podcast:${podcast.slug}`,
          event: "whisper_transcription",
          properties: {
            podcast_slug: podcast.slug,
            podcast_id: podcast.id,
            episode_id: episodeRow.id,
            duration_seconds: transcript.durationSeconds,
            cost_usd: whisperCostUsd,
            model: "whisper-1",
          },
        });
      }
      posthog.capture({
        distinctId: `podcast:${podcast.slug}`,
        event: "episode_summarised",
        properties: {
          podcast_slug: podcast.slug,
          podcast_id: podcast.id,
          episode_id: episodeRow.id,
          model: summary.modelUsed,
          input_tokens: summary.inputTokens,
          output_tokens: summary.outputTokens,
          transcript_source: transcript.source,
          haiku_cost_usd: costUsd,
          whisper_cost_usd: whisperCostUsd,
          total_cost_usd: totalCostUsd,
          duration_seconds: durationSeconds,
        },
      });
    }

    let delivery = { sent: 0, failed: 0 } as { sent: number; failed: number };
    if (recipients.length > 0) {
      const report = await sendDigest({
        recipients,
        summaryId: summaryRow.id,
        db,
        payload: {
          podcastName: podcast.name,
          episodeTitle: item.title,
          episodeUrl: `${appBaseUrl}/episodes/${episodeRow.id}`,
          listenUrl: item.link?.trim() || item.audioUrl?.trim() || null,
          keyTopics: summary.keyTopics,
          marketSignals: summary.marketSignals,
          actionableInsights: summary.actionableInsights,
          sponsorships: summary.sponsorships,
        },
      });
      delivery = { sent: report.sent, failed: report.failed };

      const ph = getPostHogServer();
      if (ph) {
        ph.capture({
          distinctId: `podcast:${podcast.slug}`,
          event: "summary_digest_sent",
          properties: {
            podcast_slug: podcast.slug,
            podcast_id: podcast.id,
            episode_id: episodeRow.id,
            summary_id: summaryRow.id,
            recipient_count: recipients.length,
            emails_sent: report.sent,
            emails_failed: report.failed,
          },
        });
        for (const row of report.perRecipient) {
          if (row.status === "failed") {
            ph.capture({
              distinctId: distinctUserId(row.userId),
              event: "summary_digest_recipient_failed",
              properties: {
                podcast_slug: podcast.slug,
                podcast_id: podcast.id,
                episode_id: episodeRow.id,
                summary_id: summaryRow.id,
              },
            });
          }
        }
        await ph.flush();
      }
    } else if (posthog) {
      await posthog.flush();
    }

    return {
      ...base,
      status: "summarised",
      sent: delivery.sent,
      failed: delivery.failed,
      costUsd: totalCostUsd,
    };
  } catch (err) {
    return {
      ...base,
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

type ServiceAdmin = {
  auth: {
    admin: {
      getUserById: (
        id: string,
      ) => Promise<{ data: { user: { email: string | null } | null } }>;
    };
  };
};

/**
 * Resolve subscriber emails for one podcast. `auth.users` isn't join-friendly
 * from the client SDK, so we read distinct subscriber ids, then ask the
 * service-role Admin API for each email.
 */
async function loadRecipients(
  db: SupabaseClient,
  podcastId: string,
): Promise<Array<{ userId: string; email: string }>> {
  const { data, error } = await db
    .from("subscriptions")
    .select("user_id")
    .eq("podcast_id", podcastId);
  if (error || !data) return [];

  const uniqueIds = Array.from(new Set(data.map((r) => r.user_id as string)));
  const admin = db as unknown as ServiceAdmin;
  const recipients: Array<{ userId: string; email: string }> = [];

  for (const userId of uniqueIds) {
    try {
      const result = await admin.auth.admin.getUserById(userId);
      const email = result.data.user?.email;
      if (email) recipients.push({ userId, email });
    } catch {
      // A single missing user shouldn't abort the run — just skip them.
    }
  }

  return recipients;
}
