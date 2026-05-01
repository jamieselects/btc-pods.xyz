-- Bitcoin Podcast Summarizer — initial schema
-- Per technical design doc §3. All tables in the public schema.
-- RLS is enabled on user-scoped tables (subscriptions, delivery_log, donations).
-- Public read on podcasts, episodes, summaries, hosts, podcast_hosts.

create extension if not exists "pgcrypto";

------------------------------------------------------------
-- podcasts
------------------------------------------------------------
create table if not exists public.podcasts (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text unique not null,
  name                     text not null,
  tagline                  text,
  description              text,
  cover_image_url          text,
  rss_url                  text not null,
  website_url              text,
  has_transcript_in_rss    boolean not null default false,
  is_curated               boolean not null default false,
  is_active                boolean not null default true,
  year_started             integer,
  publishing_frequency     text check (publishing_frequency in ('daily','weekly','bi-weekly','irregular')),
  avg_episode_length_mins  integer,
  difficulty_level         text check (difficulty_level in ('beginner','intermediate','advanced')),
  tags                     text[] default '{}',
  twitter_handle           text,
  nostr_pubkey             text,
  youtube_url              text,
  rumble_url               text,
  telegram_url             text,
  fountain_url             text,
  podcastindex_id          text,
  value4value_enabled      boolean not null default false,
  created_at               timestamptz not null default now()
);

create index if not exists podcasts_is_curated_idx on public.podcasts (is_curated) where is_curated;

------------------------------------------------------------
-- episodes
------------------------------------------------------------
create table if not exists public.episodes (
  id                  uuid primary key default gen_random_uuid(),
  podcast_id          uuid not null references public.podcasts(id) on delete cascade,
  guid                text unique not null,
  title               text not null,
  published_at        timestamptz,
  audio_url           text,
  transcript          text,
  transcript_source   text check (transcript_source in ('rss','whisper')),
  duration_seconds    integer,
  created_at          timestamptz not null default now()
);

create index if not exists episodes_podcast_id_published_at_idx
  on public.episodes (podcast_id, published_at desc);

------------------------------------------------------------
-- summaries
------------------------------------------------------------
create table if not exists public.summaries (
  id                   uuid primary key default gen_random_uuid(),
  episode_id           uuid not null references public.episodes(id) on delete cascade,
  key_topics           text,
  market_signals       text,
  actionable_insights  text,
  full_summary_md      text,
  model_used           text,
  input_tokens         integer,
  output_tokens        integer,
  created_at           timestamptz not null default now(),
  unique (episode_id)
);

------------------------------------------------------------
-- subscriptions
------------------------------------------------------------
create table if not exists public.subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  podcast_id  uuid not null references public.podcasts(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, podcast_id)
);

create index if not exists subscriptions_podcast_id_idx
  on public.subscriptions (podcast_id);

------------------------------------------------------------
-- delivery_log
------------------------------------------------------------
create table if not exists public.delivery_log (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  summary_id     uuid not null references public.summaries(id) on delete cascade,
  email_address  text not null,
  status         text not null check (status in ('sent','bounced','failed')),
  resend_id      text,
  sent_at        timestamptz not null default now()
);

create index if not exists delivery_log_user_id_idx on public.delivery_log (user_id);

------------------------------------------------------------
-- donations
------------------------------------------------------------
create table if not exists public.donations (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete set null,
  strike_invoice_id  text unique,
  amount_sats        integer not null check (amount_sats > 0),
  status             text not null check (status in ('pending','paid','expired')) default 'pending',
  paid_at            timestamptz,
  created_at         timestamptz not null default now()
);

------------------------------------------------------------
-- hosts
------------------------------------------------------------
create table if not exists public.hosts (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  bio                text,
  profile_image_url  text,
  website_url        text,
  twitter_handle     text,
  nostr_pubkey       text,
  youtube_url        text,
  linkedin_url       text,
  rumble_url         text,
  telegram_url       text,
  fountain_url       text,
  created_at         timestamptz not null default now()
);

------------------------------------------------------------
-- podcast_hosts (junction)
------------------------------------------------------------
create table if not exists public.podcast_hosts (
  podcast_id  uuid not null references public.podcasts(id) on delete cascade,
  host_id     uuid not null references public.hosts(id) on delete cascade,
  role        text not null check (role in ('host','co-host','producer')) default 'host',
  primary key (podcast_id, host_id)
);

------------------------------------------------------------
-- Row Level Security
------------------------------------------------------------

-- public-read tables: enable RLS, allow anon select.
alter table public.podcasts        enable row level security;
alter table public.episodes        enable row level security;
alter table public.summaries       enable row level security;
alter table public.hosts           enable row level security;
alter table public.podcast_hosts   enable row level security;

create policy "podcasts public read"      on public.podcasts        for select to anon, authenticated using (true);
create policy "episodes public read"      on public.episodes        for select to anon, authenticated using (true);
create policy "summaries public read"     on public.summaries       for select to anon, authenticated using (true);
create policy "hosts public read"         on public.hosts           for select to anon, authenticated using (true);
create policy "podcast_hosts public read" on public.podcast_hosts   for select to anon, authenticated using (true);

-- user-scoped tables.
alter table public.subscriptions  enable row level security;
alter table public.delivery_log   enable row level security;
alter table public.donations      enable row level security;

create policy "subscriptions owner read"
  on public.subscriptions for select to authenticated
  using (auth.uid() = user_id);

create policy "subscriptions owner write"
  on public.subscriptions for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delivery_log owner read"
  on public.delivery_log for select to authenticated
  using (auth.uid() = user_id);

create policy "donations owner read"
  on public.donations for select to authenticated
  using (auth.uid() = user_id);

-- Donations may be inserted anonymously (user_id NULL) before signup.
create policy "donations anon insert"
  on public.donations for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);
