-- Curated adds: The Bitcoin Layer, Presidio Bitcoin Jam.
-- Coin Stories + The Pomp Podcast are already seeded in 004 — no insert here.

insert into public.podcasts (
  slug, name, tagline, description, rss_url, website_url,
  has_transcript_in_rss, is_curated, is_active, year_started,
  publishing_frequency, difficulty_level, tags, twitter_handle
) values (
  'the-bitcoin-layer',
  'The Bitcoin Layer',
  'Global macro meets Bitcoin intelligence.',
  'Nik Bhatia and guests connect global macro, rates, FX, and geopolitics to Bitcoin—how layered money, credit, and policy shape the case for a digital bearer asset.',
  'https://feeds.simplecast.com/Y2219Riv',
  'https://thebitcoinlayer.com',
  false, true, true, 2024,
  'weekly', 'intermediate',
  array['macro','markets','bitcoin']::text[],
  null
),
(
  'presidio-bitcoin',
  'Presidio Bitcoin Jam',
  'Weekly live Bitcoin jam from Presidio.',
  'David King, Steve Lee, and Max Webster on Bitcoin—technical depth, markets, and how Bitcoin interfaces with the broader financial system.',
  'https://feeds.fountain.fm/UnefO3pkSLLDwIGz0Xq1',
  'https://presidiobitcoin.substack.com/podcast',
  false, true, true, 2024,
  'weekly', 'intermediate',
  array['bitcoin','culture','markets']::text[],
  null
)
on conflict (slug) do nothing;

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/7f/e1/29/7fe1293b-9d71-5407-5a3f-ac6255722ea1/mza_9282521562477331766.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-layer';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/f0/b8/eb/f0b8ebe6-f522-2175-b56b-415b0386bbf2/mza_16165246650713654522.jpg/600x600bb.jpg'
where slug = 'presidio-bitcoin';
