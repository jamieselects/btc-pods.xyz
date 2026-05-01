-- Seed the three curated launch podcasts per design doc §10.
-- Uses ON CONFLICT (slug) DO NOTHING so reruns are idempotent.

insert into public.podcasts (
  slug, name, tagline, description, rss_url, website_url,
  has_transcript_in_rss, is_curated, is_active, year_started,
  publishing_frequency, difficulty_level, tags, twitter_handle
) values (
  'what-bitcoin-did',
  'What Bitcoin Did',
  'Long-form interviews on Bitcoin, money, and freedom.',
  'Peter McCormack''s flagship podcast covering the people, culture, and economics of Bitcoin. Notable for publishing full transcripts in the RSS feed.',
  'https://feeds.megaphone.fm/whatbitcoindid',
  'https://www.whatbitcoindid.com',
  true, true, true, 2017,
  'weekly', 'intermediate',
  array['interviews','economics','culture'],
  'WhatBitcoinDid'
),
(
  'stephan-livera-podcast',
  'Stephan Livera Podcast',
  'Bitcoin, Austrian economics, and self-sovereignty.',
  'Stephan Livera interviews Bitcoin developers, economists, and entrepreneurs. Many episodes link to a transcript in the show notes.',
  'https://anchor.fm/s/4d60d4cc/podcast/rss',
  'https://stephanlivera.com',
  false, true, true, 2018,
  'weekly', 'advanced',
  array['economics','technical','austrian'],
  'stephanlivera'
),
(
  'the-hurdle-rate',
  'The Hurdle Rate',
  'Bitcoin treasury strategy for businesses.',
  'A show about Bitcoin as a corporate treasury asset, valuation frameworks, and capital allocation. RSS feed and transcript availability to be verified before launch.',
  'https://feeds.simplecast.com/the-hurdle-rate',
  'https://thehurdlerate.com',
  false, true, true, 2024,
  'weekly', 'intermediate',
  array['finance','treasury','corporate'],
  null
)
on conflict (slug) do nothing;
