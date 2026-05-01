-- Additional curated Bitcoin podcasts. ON CONFLICT (slug) DO NOTHING for idempotent reruns.

insert into public.podcasts (
  slug, name, tagline, description, rss_url, website_url,
  has_transcript_in_rss, is_curated, is_active, year_started,
  publishing_frequency, difficulty_level, tags, twitter_handle
) values (
  'bitcoin-standard-podcast',
  'The Bitcoin Standard Podcast',
  'Bitcoin and economics from the Austrian school perspective.',
  'Saifedean Ammous hosts weekly seminars and discussions on Bitcoin, Austrian economics, and money—plus select guest interviews from across the ecosystem.',
  'https://feeds.buzzsprout.com/1849151.rss',
  'https://saifedean.com/podcast',
  false, true, true, 2020,
  'weekly', 'advanced',
  array['economics','austrian','education'],
  'saifedean'
),
(
  'the-jack-mallers-show',
  'The Jack Mallers Show',
  'Bitcoin, macro, markets, and the future of money.',
  'Jack Mallers covers the biggest stories in Bitcoin, macroeconomics, financial markets, and payments—often recorded live with audience Q&A.',
  'https://anchor.fm/s/e29097f4/podcast/rss',
  'https://www.youtube.com/@TheJackMallersShow',
  false, true, true, 2023,
  'weekly', 'intermediate',
  array['macro','markets','payments'],
  'jackmallers'
),
(
  'coin-stories',
  'Coin Stories with Natalie Brunell',
  'Interviews on money, Bitcoin, and the road ahead.',
  'Journalist Natalie Brunell talks with leaders in Bitcoin, policy, and finance about sound money, adoption, and fixing the monetary system.',
  'https://coinstories.libsyn.com/rss',
  'https://coinstories.libsyn.com',
  false, true, true, 2021,
  'weekly', 'beginner',
  array['interviews','education','culture'],
  'natbrunell'
),
(
  'the-pomp-podcast',
  'The Pomp Podcast',
  'Business, finance, and Bitcoin with Anthony Pompliano.',
  'Daily conversations with founders, investors, and builders at the intersection of technology, markets, and Bitcoin.',
  'https://anchor.fm/s/b4841110/podcast/rss',
  'https://anthonyonchain.com',
  false, true, true, 2018,
  'daily', 'intermediate',
  array['business','investing','interviews'],
  'APompliano'
),
(
  'tftc',
  'TFTC: A Bitcoin Podcast',
  'Long-form Bitcoin conversations with Marty Bent.',
  'Marty Bent''s flagship show—deep dives on Bitcoin, mining, energy, culture, and the signal worth your time.',
  'https://feeds.fountain.fm/ZwwaDULvAj0yZvJ5kdB9',
  'https://tftc.io',
  false, true, true, 2017,
  'weekly', 'intermediate',
  array['culture','mining','interviews'],
  'MartyBent'
),
(
  'mr-m-podcast',
  'Mr. M Podcast | Maurizio Pedrazzoli Grazioli',
  'Conversations with people shaping Bitcoin.',
  'Maurizio Pedrazzoli Grazioli hosts long-form interviews with entrepreneurs, analysts, and educators across Bitcoin and digital assets.',
  'https://feed.podbean.com/mauriziopedrazzoligrazioli/feed.xml',
  'https://mrmpodcast.com',
  false, true, true, 2022,
  'weekly', 'intermediate',
  array['interviews','culture'],
  'mrmpodcast'
),
(
  'onramp',
  'Onramp Bitcoin Media',
  'Bitcoin-native media: macro, protocol, and professional allocation.',
  'Flagship shows including The Last Trade, Final Settlement, and Scarce Assets—markets, development, and allocator perspectives in one feed.',
  'https://anchor.fm/s/e01a5d48/podcast/rss',
  'https://onrampbitcoin.com',
  false, true, true, 2023,
  'weekly', 'intermediate',
  array['macro','institutional','research'],
  null
),
(
  'the-bitcoin-way-podcast',
  'The Bitcoin Way Podcast',
  'Self-custody, education, and interviews with Bitcoin builders.',
  'The Bitcoin Way team explores onboarding, security, and macro through guest interviews and regular Bitcoin Banter episodes.',
  'https://feeds.buzzsprout.com/2334006.rss',
  'https://www.thebitcoinway.com/podcast',
  false, true, true, 2024,
  'weekly', 'beginner',
  array['self-custody','education','interviews'],
  'thebitcoinway_'
)
on conflict (slug) do nothing;

-- Cover art (Apple Podcasts CDN, 600×600).
update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/fc/a5/38/fca5380d-362d-d44c-04f5-df14044e88ac/mza_4951446082004808256.jpg/600x600bb.jpg'
where slug = 'bitcoin-standard-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/61/49/1b/61491bb4-1722-24b7-12db-f5826faa3a20/mza_14614483371884635476.jpg/600x600bb.jpg'
where slug = 'the-jack-mallers-show';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/94/b4/4c/94b44cb2-3384-9d1f-3467-c8c09cb74fc0/mza_888712040220204964.png/600x600bb.jpg'
where slug = 'coin-stories';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/fa/96/bd/fa96bd9b-a097-307a-22f6-58bb46928d90/mza_12987508790565375699.jpg/600x600bb.jpg'
where slug = 'the-pomp-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/84/cd/73/84cd73e4-eddb-d7f6-a777-875efb65b924/mza_15569173368189135395.jpg/600x600bb.jpg'
where slug = 'tftc';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/2c/e1/31/2ce13187-b313-0dc4-93ee-cba9cd5cad9e/mza_5526135508304500829.jpg/600x600bb.jpg'
where slug = 'mr-m-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/27/6f/27/276f275a-e98b-d6d2-c019-9e520ae4c499/mza_17083993848105044845.jpg/600x600bb.jpg'
where slug = 'onramp';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/95/bb/1d/95bb1d68-f9eb-bac4-ad28-8ed5fc19bfaa/mza_5386639132831137204.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-way-podcast';
