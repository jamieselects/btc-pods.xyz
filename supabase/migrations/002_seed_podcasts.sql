-- Seed the three curated launch podcasts per design doc §10.
-- Uses ON CONFLICT (slug) DO NOTHING so reruns are idempotent.

insert into public.podcasts (
  slug, name, tagline, description, rss_url, website_url,
  has_transcript_in_rss, is_curated, is_active, year_started,
  publishing_frequency, difficulty_level, tags, twitter_handle
) values (
  'what-bitcoin-did',
  'What Bitcoin Did',
  'What Bitcoin Did unpacks Bitcoin''s role in reshaping money, freedom, and the future of finance.',
  'Long-form interviews hosted by Danny Knowles on Bitcoin, money, culture, and politics. Many episodes ship full transcripts in the RSS feed.',
  'https://feeds.fountain.fm/UZSKQcrOnhqYS1JopxGg',
  'https://www.whatbitcoindid.com',
  true, true, true, 2017,
  'weekly', 'intermediate',
  array['interviews','economics','culture'],
  '_DannyKnowles'
),
(
  'stephan-livera-podcast',
  'Stephan Livera Podcast',
  'Bitcoin, Austrian economics, and self-sovereignty.',
  'Stephan Livera interviews Bitcoin developers, economists, and entrepreneurs. Many episodes link to a transcript in the show notes.',
  'https://anchor.fm/s/7d083a4/podcast/rss',
  'https://stephanlivera.com',
  false, true, true, 2018,
  'weekly', 'advanced',
  array['economics','technical','austrian'],
  'stephanlivera'
),
(
  'the-hurdle-rate',
  'The Hurdle Rate Podcast',
  'Bitcoin treasury strategy for businesses.',
  'A show about Bitcoin as a corporate treasury asset, valuation frameworks, and capital allocation.',
  'https://feed.podbean.com/thehurdleratepod/feed.xml',
  'https://thehurdlerate.com',
  false, true, true, 2024,
  'weekly', 'intermediate',
  array['finance','treasury','corporate'],
  null
)
on conflict (slug) do nothing;
