/**
 * Minimal Supabase database types. Mirrors the schema in
 * `supabase/migrations/001_init.sql` — keep the two in sync by hand
 * until we wire up `supabase gen types` in phase 3.
 */

export type PublishingFrequency = "daily" | "weekly" | "bi-weekly" | "irregular";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type TranscriptSource = "rss" | "whisper";
export type DeliveryStatus = "sent" | "bounced" | "failed";
export type DonationStatus = "pending" | "paid" | "expired";
export type HostRole = "host" | "co-host" | "producer";

export type PodcastRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  cover_image_url: string | null;
  rss_url: string;
  website_url: string | null;
  has_transcript_in_rss: boolean;
  is_curated: boolean;
  is_active: boolean;
  year_started: number | null;
  publishing_frequency: PublishingFrequency | null;
  avg_episode_length_mins: number | null;
  difficulty_level: DifficultyLevel | null;
  tags: string[];
  twitter_handle: string | null;
  nostr_pubkey: string | null;
  youtube_url: string | null;
  rumble_url: string | null;
  telegram_url: string | null;
  fountain_url: string | null;
  spotify_url: string | null;
  podcastindex_id: string | null;
  value4value_enabled: boolean;
  created_at: string;
};

export type EpisodeRow = {
  id: string;
  podcast_id: string;
  guid: string;
  title: string;
  published_at: string | null;
  audio_url: string | null;
  transcript: string | null;
  transcript_source: TranscriptSource | null;
  duration_seconds: number | null;
  created_at: string;
};

export type SummaryRow = {
  id: string;
  episode_id: string;
  key_topics: string | null;
  market_signals: string | null;
  actionable_insights: string | null;
  full_summary_md: string | null;
  model_used: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  created_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  podcast_id: string;
  created_at: string;
};

export type DeliveryLogRow = {
  id: string;
  user_id: string;
  summary_id: string;
  email_address: string;
  status: DeliveryStatus;
  resend_id: string | null;
  sent_at: string;
};

export type DonationRow = {
  id: string;
  user_id: string | null;
  strike_invoice_id: string | null;
  amount_sats: number;
  status: DonationStatus;
  paid_at: string | null;
  created_at: string;
};

export type HostRow = {
  id: string;
  name: string;
  bio: string | null;
  profile_image_url: string | null;
  website_url: string | null;
  twitter_handle: string | null;
  nostr_pubkey: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  rumble_url: string | null;
  telegram_url: string | null;
  fountain_url: string | null;
  created_at: string;
};

export type PodcastHostRow = {
  podcast_id: string;
  host_id: string;
  role: HostRole;
};
