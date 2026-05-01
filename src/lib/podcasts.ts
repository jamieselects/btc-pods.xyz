import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  EpisodeRow,
  PodcastRow,
  SummaryRow,
} from "@/lib/supabase/types";

/**
 * Server-only data-access helpers for podcasts / episodes / summaries.
 * Each helper swallows the "Supabase not configured" error so pages can
 * render an empty state during local dev without env vars.
 */

export async function listCuratedPodcasts(): Promise<PodcastRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("is_active", true)
      .eq("is_curated", true)
      .order("name", { ascending: true });
    if (error) return [];
    return (data ?? []) as PodcastRow[];
  } catch {
    return [];
  }
}

export async function getPodcastBySlug(
  slug: string,
): Promise<PodcastRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return null;
    return (data as PodcastRow) ?? null;
  } catch {
    return null;
  }
}

export type EpisodeWithSummary = EpisodeRow & {
  summary: Pick<SummaryRow, "id" | "key_topics"> | null;
};

export async function listEpisodesForPodcast(
  podcastId: string,
  limit = 20,
): Promise<EpisodeWithSummary[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("episodes")
      .select(
        "id, podcast_id, guid, title, published_at, audio_url, transcript, transcript_source, duration_seconds, created_at, summary:summaries(id, key_topics)",
      )
      .eq("podcast_id", podcastId)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) return [];

    return (data ?? []).map((row) => {
      const summaryField = (row as unknown as { summary: unknown }).summary;
      const summary = Array.isArray(summaryField)
        ? (summaryField[0] as EpisodeWithSummary["summary"]) ?? null
        : ((summaryField as EpisodeWithSummary["summary"]) ?? null);
      return { ...(row as EpisodeRow), summary };
    });
  } catch {
    return [];
  }
}

export async function getEpisodeWithSummary(
  episodeId: string,
): Promise<(EpisodeRow & { summary: SummaryRow | null; podcast: PodcastRow | null }) | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("episodes")
      .select(
        "*, summary:summaries(*), podcast:podcasts(*)",
      )
      .eq("id", episodeId)
      .maybeSingle();
    if (error || !data) return null;

    const summaryField = (data as unknown as { summary: unknown }).summary;
    const podcastField = (data as unknown as { podcast: unknown }).podcast;
    const summary = Array.isArray(summaryField)
      ? (summaryField[0] as SummaryRow) ?? null
      : ((summaryField as SummaryRow) ?? null);
    const podcast = Array.isArray(podcastField)
      ? (podcastField[0] as PodcastRow) ?? null
      : ((podcastField as PodcastRow) ?? null);

    return { ...(data as EpisodeRow), summary, podcast };
  } catch {
    return null;
  }
}

export async function listUserSubscriptionPodcastIds(
  userId: string,
): Promise<Set<string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("podcast_id")
      .eq("user_id", userId);
    if (error) return new Set();
    return new Set((data ?? []).map((row) => row.podcast_id as string));
  } catch {
    return new Set();
  }
}

export async function listUserSubscribedPodcasts(
  userId: string,
): Promise<PodcastRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("podcast:podcasts(*)")
      .eq("user_id", userId);
    if (error) return [];

    return (data ?? [])
      .map((row) => {
        const field = (row as unknown as { podcast: unknown }).podcast;
        if (Array.isArray(field)) return (field[0] as PodcastRow) ?? null;
        return (field as PodcastRow) ?? null;
      })
      .filter((p): p is PodcastRow => Boolean(p));
  } catch {
    return [];
  }
}

export type RecentSummary = {
  episodeId: string;
  episodeTitle: string;
  podcastName: string;
  publishedAt: string | null;
  keyTopics: string | null;
};

export async function listRecentSummariesForUser(
  userId: string,
  limit = 10,
): Promise<RecentSummary[]> {
  try {
    const supabase = await createClient();
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("podcast_id")
      .eq("user_id", userId);

    const podcastIds = (subs ?? []).map((s) => s.podcast_id as string);
    if (podcastIds.length === 0) return [];

    const { data, error } = await supabase
      .from("episodes")
      .select(
        "id, title, published_at, podcast:podcasts(name), summary:summaries(key_topics)",
      )
      .in("podcast_id", podcastIds)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) return [];

    return (data ?? [])
      .map((row): RecentSummary | null => {
        const summaryField = (row as unknown as { summary: unknown }).summary;
        const podcastField = (row as unknown as { podcast: unknown }).podcast;
        const summary = Array.isArray(summaryField)
          ? summaryField[0]
          : summaryField;
        const podcast = Array.isArray(podcastField)
          ? podcastField[0]
          : podcastField;
        if (!summary) return null;
        return {
          episodeId: row.id as string,
          episodeTitle: row.title as string,
          podcastName: (podcast as { name?: string } | null)?.name ?? "",
          publishedAt: (row.published_at as string | null) ?? null,
          keyTopics:
            (summary as { key_topics?: string | null } | null)?.key_topics ??
            null,
        };
      })
      .filter((x): x is RecentSummary => x !== null);
  } catch {
    return [];
  }
}
