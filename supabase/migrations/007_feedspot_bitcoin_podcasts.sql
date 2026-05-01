-- FeedSpot bitcoin podcast directory (April 2026 export).
-- Source: https://podcast.feedspot.com/bitcoin_podcasts/
-- Feeds validated via GET; overlaps with podcasts in migrations 002/004 excluded.

insert into public.podcasts (
  slug, name, tagline, description, rss_url, website_url,
  has_transcript_in_rss, is_curated, is_active, year_started,
  publishing_frequency, difficulty_level, tags, twitter_handle
) values
(
  'btc-sessions',
  'BTC Sessions',
  'Ben Perrin',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/11e95d20/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-peter-mccormack-show',
  'The Peter McCormack Show',
  'Peter McCormack',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.acast.com/public/shows/69d4f193b76468caacc5068f',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'coindesk-podcast-network',
  'CoinDesk Podcast Network',
  'CoinDesk',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.megaphone.fm/CDI1034178673',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-spaces-live',
  'Bitcoin Spaces Live',
  'BTC Media',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/cee95218/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'fed-watch-bitcoin-and-macro',
  'Fed Watch - Bitcoin and Macro',
  'Bitcoin Magazine',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/cef93bec/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-takeover-podcast',
  'Bitcoin Takeover Podcast',
  'Vlad Costea',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://bitcoin-takeover.com/audio/feed.xml',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'noded-bitcoin-podcast',
  'Noded Bitcoin Podcast',
  'Noded Bitcoin Podcast',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.soundcloud.com/users/soundcloud:users:343665466/sounds.rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'building-on-a-bitcoin-standard',
  'Building on a Bitcoin Standard',
  'Lila Arambula',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/108804e0/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'magic-internet-money',
  'Magic Internet Money',
  null,
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://magicinternetmoney.libsyn.com/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-rapid-fire',
  'Bitcoin Rapid-Fire',
  'John Vallis',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/d6b3354/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'once-bitten-a-bitcoin-podcast',
  'Once Bitten! A Bitcoin Podcast.',
  'Daniel Prince',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.fountain.fm/sokYhfsuGnDIQ10FLdqm',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'blue-collar-bitcoin',
  'Blue Collar Bitcoin',
  'Blue Collar Bitcoin Podcast',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feed.podbean.com/bluecollarbitcoinpodcast/feed.xml',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-audible',
  'Bitcoin Audible',
  'Guy Swann',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.castos.com/mj96z',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'relai-bitcoin-podcast',
  'Relai Bitcoin Podcast',
  'Relai',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/42c63e90/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-brilliance',
  'Bitcoin Brilliance',
  'Jeff - Sly Goomba',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/4c24939c/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-kindergarten-live-q-a',
  'Bitcoin Kindergarten Live Q&A',
  'Bitcoin Kindergarten',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/20a9fcc0/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-fixes-this',
  'Bitcoin Fixes This',
  'Jimmy Song',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/2a4e8034/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'built-on-bitcoin-with-jacob-brown',
  'Built on Bitcoin with Jacob Brown',
  'Jake',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/10604ca98/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-bitcoin-collective',
  'The Bitcoin Collective',
  'Jordan Walker',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/eae74420/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'swan-signal-live-a-bitcoin-show',
  'Swan Signal Live - A Bitcoin Show',
  'Swan Bitcoin',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.simplecast.com/Z1tu2Hds',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-for-advisors',
  'Bitcoin for Advisors',
  'Morgen and Pierre Rochard',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://rss.buzzsprout.com/1761020.rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'tucson-bitcoin-podcast',
  'Tucson Bitcoin Podcast',
  'Tucson Bitcoin',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.redcircle.com/7b178760-c42d-4cac-b43c-fb08cf39b978',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'decrypt-news',
  'Decrypt News',
  'Decrypt Media',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.acast.com/public/shows/61aa589af86cba0013562429',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'navigating-bitcoin-s-noise',
  'Navigating Bitcoin''s Noise',
  'Kane McGukin',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://www.spreaker.com/show/4990519/episodes/feed',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-ben',
  'BITCOIN BEN',
  'BITCOIN BEN',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/bf19e00/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-is-hard',
  'Bitcoin is Hard',
  'Choice',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/72cabbe8/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-bitcoin-pitch-podcast',
  'The Bitcoin Pitch Podcast',
  'Babyy_Patt',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/6a5dbc1c/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'blockware-podcast',
  'Blockware Podcast',
  'Mitchell Askew',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/6c5dfd9c/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'meet-the-bitcoin-taco-plebs-bitcoin-magazine',
  'Meet the Bitcoin Taco Plebs - Bitcoin Magazine',
  'Bitcoin Magazine',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/ceee3cb0/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'speaking-of-bitcoin-formerly-let-s-talk-bitcoin',
  'Speaking of Bitcoin (formerly Let''s Talk Bitcoin!)',
  'Adam B. Levine',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/b421fd4/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-made-simple-podcast',
  'Bitcoin Made Simple Podcast',
  'BMS Podcast Network',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/49a0a3f4/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-boomer-show-with-gary-leland',
  'Bitcoin Boomer Show with Gary Leland',
  'BizTalkPodcasts',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://www.spreaker.com/show/4622622/episodes/feed',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-bitcoin-boomer-show',
  'The Bitcoin Boomer Show',
  'Gary Leland the Bitcoin Boomer',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.captivate.fm/bitcoin-boomer/',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-markets',
  'Bitcoin & Markets',
  'Ansel Lindner',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://rss.libsyn.com/shows/180626/destinations/1230017.xml',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-infinity-podcast',
  'Bitcoin Infinity Podcast',
  'Ram & Krishna',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/e3b6fdf8/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-magazine-podcast',
  'Bitcoin Magazine Podcast',
  'BTC Media',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/cefa18a0/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-bitcoin-cash-podcast',
  'The Bitcoin Cash Podcast',
  'Jeremy',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://media.rss.com/bitcoincashpodcast/feed.xml',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-basics-help',
  'Bitcoin Basics Help',
  'BitcoinBasics.Help',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://coincompass.com/feed/podcast',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'global-bitcoin-fest-podcast',
  'Global Bitcoin Fest Podcast',
  'Global Bitcoin Fest',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/7b146ca4/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-world-crypto-network-podcast',
  'The World Crypto Network Podcast',
  'Forbidden Knowledge Network',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://www.spreaker.com/show/3478703/episodes/feed',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'state-of-bitcoin-with-brandon-keys',
  'State of Bitcoin with Brandon Keys',
  'Green Candle Investments',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.fountain.fm/u59Boi42aXChVy0qnxqY',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-optech-podcast',
  'Bitcoin Optech Podcast',
  'Bitcoin Optech',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/d9918154/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-bitcoin-game',
  'The Bitcoin Game',
  'Rob Mitchell',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://rss.libsyn.com/shows/120573/destinations/702928.xml',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'raleigh-bitcoin',
  'Raleigh Bitcoin',
  'Raleigh Bitcoin',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/c7f77ac/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-bitcoin-podcast',
  'THE Bitcoin Podcast',
  'Walker America',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.fountain.fm/VV0f6IwusQoi5kOqvNCx',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-caf-bitcoin-podcast',
  'The Café Bitcoin Podcast',
  'Swan Bitcoin',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.simplecast.com/H9Jmx_ko',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'builders-in-bitcoin',
  'Builders In Bitcoin',
  'Rod @bitkite',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/aac51cdc/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'one-love-bitcoin',
  'One Love Bitcoin',
  'Dread',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.simplecast.com/a71_9NKz',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'pleb-underground',
  'Pleb UnderGround',
  'Pleb UnderGround',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/add2abc4/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoiners-live-from-bitcoin-beach',
  'Bitcoiners - Live From Bitcoin Beach',
  'Mike Peterson',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://rss.buzzsprout.com/2087930.rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-bitcoin-matrix',
  'The Bitcoin Matrix',
  'Cedric Youngelman',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.fountain.fm/paBeJqepFBns3bT2OAtC',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-bitcoin-knowledge-podcast',
  'The Bitcoin Knowledge Podcast',
  'Trace Mayer',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://www.bitcoin.kn/feed/podcast/',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-chaincode-podcast',
  'The Chaincode Podcast',
  'Chaincode Labs',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/12fe0620/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-bitcoin-source-a-bitcoin-conversation',
  'The Bitcoin Source: A Bitcoin Conversation',
  'The Bitcoin Source',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/ad63abc0/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-terminal-value',
  'Bitcoin Terminal value',
  null,
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://rss.buzzsprout.com/1318159.rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-in-africa-show',
  'Bitcoin In Africa Show',
  'Charlene Fadirepo',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/4cb3c508/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'hell-money',
  'Hell Money',
  'Hell Money',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/9968c7a4/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'energizing-bitcoin-ai',
  'Energizing Bitcoin & Ai',
  'Justin Ballard & Jake Corley',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.transistor.fm/energizing-bitcoin',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-bitcoin-infinity-show',
  'The Bitcoin Infinity Show',
  'Knut Svanholm and Luke de Wolf',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://feeds.fountain.fm/PGQg9eWxyOcGhx0uXamY',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcast-everything-bitcoin',
  'Bitcast - Everything Bitcoin',
  'Sol Good Network',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://www.spreaker.com/show/5802925/episodes/feed',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-canadian-bitcoiners-podcast-bitcoin-news-with-a-canadian-spin',
  'The Canadian Bitcoiners Podcast - Bitcoin News With a Canadian Spin',
  'Joey and Len',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/538d43f4/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'bitcoin-review-podcast-with-nvk-guests',
  'Bitcoin.Review Podcast with NVK & Guests',
  'Bitcoin.Review',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://serve.podhome.fm/rss/7cd0202b-463c-5b2e-b252-d4845cb71466',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  '21st-capital',
  '21st Capital',
  '21st Capital',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://anchor.fm/s/86c5a900/podcast/rss',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  'the-path-to-bitcoin',
  'The Path to Bitcoin',
  'Anon',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://thepathtobitcoin.com/feed/podcast/',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
),
(
  '4-minute-bitcoin-daily-news',
  '4 Minute Bitcoin Daily News',
  'Gary Leland the Bitcoin Boomer',
  'Featured in FeedSpot''s Best Bitcoin Podcasts (https://podcast.feedspot.com/bitcoin_podcasts/).',
  'https://www.spreaker.com/show/4318711/episodes/feed',
  null,
  false, true, true,
  null,
  'weekly', 'intermediate',
  array['bitcoin']::text[],
  null
)
on conflict (slug) do nothing;

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/ad/68/d3/ad68d3b2-da73-817a-cb74-85b868e4eab6/mza_17011046795583044673.jpg/600x600bb.jpg'
where slug = 'btc-sessions';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/f8/fb/5e/f8fb5ea0-804e-f84f-002c-7eb151afbe6a/mza_11059261165452742953.jpg/600x600bb.jpg'
where slug = 'the-peter-mccormack-show';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/0f/7b/15/0f7b1583-4cd5-7664-240a-9d58ba31f132/mza_10938044496719092085.jpeg/600x600bb.jpg'
where slug = 'coindesk-podcast-network';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/14/03/86/140386e9-c08e-9d77-791e-514a19bcf9ec/mza_11072176486005592809.jpeg/600x600bb.jpg'
where slug = 'bitcoin-spaces-live';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/74/06/cd/7406cd95-8745-2c94-57dd-a0acf784ceb0/mza_11057684793081251161.png/600x600bb.jpg'
where slug = 'fed-watch-bitcoin-and-macro';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/22/d1/fe/22d1feef-a273-83ed-2a5a-c57517347305/mza_15177909466262744530.jpg/600x600bb.jpg'
where slug = 'bitcoin-takeover-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts123/v4/9c/87/96/9c8796fc-3a42-3a78-2017-2c1632d49cfd/mza_8295887901449303808.jpg/600x600bb.jpg'
where slug = 'noded-bitcoin-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts112/v4/1b/85/9d/1b859d6e-ac8a-c098-009e-b987bec91d68/mza_1472360615549942768.jpg/600x600bb.jpg'
where slug = 'building-on-a-bitcoin-standard';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/98/fc/72/98fc7266-e119-d269-cb1e-90d715b40394/mza_7019450576033496079.jpg/600x600bb.jpg'
where slug = 'bitcoin-rapid-fire';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/a8/2f/36/a82f3675-c69d-b076-9fbe-eb6e7d69c5a8/mza_2824796342334185417.jpg/600x600bb.jpg'
where slug = 'once-bitten-a-bitcoin-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/81/98/47/819847ae-9505-b33a-0f9c-910cd65455f2/mza_17062297132751980193.png/600x600bb.jpg'
where slug = 'blue-collar-bitcoin';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/a8/1c/b2/a81cb23a-7aa5-c123-60a1-9e5d0335496b/mza_12623622548899082019.jpg/600x600bb.jpg'
where slug = 'bitcoin-audible';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts122/v4/11/0d/ad/110dad7b-7e59-274d-a730-d189f0f661fe/mza_17492493465284920200.jpg/600x600bb.jpg'
where slug = 'relai-bitcoin-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/57/09/09/570909ee-b9f6-d235-7d0e-b844cfa37568/mza_13671133330995918928.jpg/600x600bb.jpg'
where slug = 'bitcoin-brilliance';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/08/94/18/089418f7-cc65-0bb0-f52e-33356b145cdf/mza_4004626109260206448.jpg/600x600bb.jpg'
where slug = 'bitcoin-kindergarten-live-q-a';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts124/v4/1f/ee/1e/1fee1eff-a7ef-7dec-4e15-f3ab72bdf068/mza_5281607754268309327.jpg/600x600bb.jpg'
where slug = 'bitcoin-fixes-this';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/e1/ea/f8/e1eaf8c3-ead1-ce3c-0bbe-4904f7eca553/mza_9064703692901286452.jpeg/600x600bb.jpg'
where slug = 'built-on-bitcoin-with-jacob-brown';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/29/09/54/290954ae-e1dd-5cea-63d1-750661ac068a/mza_491176417908886157.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-collective';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/9b/c7/a0/9bc7a0d2-9ff6-fd2c-aae9-c1e682c09ef2/mza_11900136921121048479.jpg/600x600bb.jpg'
where slug = 'swan-signal-live-a-bitcoin-show';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/4a/23/fa/4a23fa78-15d1-067d-51fb-f24e438945be/mza_9241072608699798267.jpg/600x600bb.jpg'
where slug = 'bitcoin-for-advisors';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/90/b9/f3/90b9f33e-5ca6-2008-1f71-028dff643374/mza_14710587868172800853.jpg/600x600bb.jpg'
where slug = 'tucson-bitcoin-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/dd/67/da/dd67daad-9b1b-926f-d96a-5c9b2918fa78/mza_14241046592780498537.jpeg/600x600bb.jpg'
where slug = 'decrypt-news';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/da/de/9f/dade9f4e-c37e-5388-3d05-2d524ece35fd/mza_11286416511354994848.jpg/600x600bb.jpg'
where slug = 'navigating-bitcoin-s-noise';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/71/76/be/7176be08-1d96-52ea-34de-c0afdc020c05/mza_12490903719527621615.jpg/600x600bb.jpg'
where slug = 'bitcoin-ben';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/36/9e/be/369ebe87-2f91-8804-2605-361c48a35606/mza_16804823693536019743.jpg/600x600bb.jpg'
where slug = 'bitcoin-is-hard';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/84/bd/06/84bd06a6-66b3-195a-52ea-056649d10670/mza_5017658208846116424.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-pitch-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/d8/d7/23/d8d72302-724a-7f06-d3e4-894fe8cfe401/mza_3278838970541528362.jpg/600x600bb.jpg'
where slug = 'blockware-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/18/6c/ce/186ccefd-4115-0103-fd38-17d1e1363899/mza_6314990080795970940.png/600x600bb.jpg'
where slug = 'meet-the-bitcoin-taco-plebs-bitcoin-magazine';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts114/v4/12/41/66/1241661a-8656-0a73-2919-036e60031f32/mza_8259744837161003045.jpg/600x600bb.jpg'
where slug = 'speaking-of-bitcoin-formerly-let-s-talk-bitcoin';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/a0/ed/c9/a0edc9a8-f588-7d3c-2390-b248284968f9/mza_3371672078307360812.jpg/600x600bb.jpg'
where slug = 'bitcoin-made-simple-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/d3/f2/a0/d3f2a0da-9120-a293-fefa-ef5fb20534ac/mza_11954737627136999495.jpg/600x600bb.jpg'
where slug = 'bitcoin-boomer-show-with-gary-leland';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts112/v4/21/26/9f/21269f14-aab6-88e3-47e4-3b4fa6b0093b/mza_1040703386209843667.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-boomer-show';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/6b/88/31/6b883139-1a26-96ac-62d1-cac2c2c37614/mza_15908434186564761422.jpg/600x600bb.jpg'
where slug = 'bitcoin-markets';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts112/v4/ba/bc/d3/babcd393-992e-68a8-dc30-c47879d604d6/mza_16656079201129812560.jpg/600x600bb.jpg'
where slug = 'bitcoin-infinity-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/ac/ae/db/acaedb6a-8d05-1ced-555d-c9503431478f/mza_436577427972612537.jpg/600x600bb.jpg'
where slug = 'bitcoin-magazine-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts112/v4/e0/4b/9d/e04b9d25-cfce-c621-e3c9-0cd4e8224984/mza_10590467326796096522.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-cash-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/3b/98/26/3b9826cd-460f-bca1-4598-76d76730069f/mza_7782172200811005467.jpg/600x600bb.jpg'
where slug = 'bitcoin-basics-help';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/cb/e2/95/cbe29547-9e9e-3c01-a31d-ffe1db62b76c/mza_7561612631638337767.jpg/600x600bb.jpg'
where slug = 'global-bitcoin-fest-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/ab/d1/99/abd1998d-e81e-f7c3-49ce-e8d29d76e725/mza_613929772988302579.jpg/600x600bb.jpg'
where slug = 'the-world-crypto-network-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/47/8b/67/478b677e-b7b0-94c0-3429-586dac627e9e/mza_14692759086049520079.jpg/600x600bb.jpg'
where slug = 'state-of-bitcoin-with-brandon-keys';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/41/ef/4f/41ef4fa2-2113-92b9-194c-3a239274d2ab/mza_11264644619174819276.jpg/600x600bb.jpg'
where slug = 'bitcoin-optech-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/dd/8f/f6/dd8ff685-63c7-8d41-a5b7-948a2cb0a539/mza_1637394721897974396.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-game';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/3e/8b/ed/3e8bed4b-0021-a52f-20e5-7a51807e83b8/mza_10437805454729998786.jpg/600x600bb.jpg'
where slug = 'raleigh-bitcoin';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/23/19/1e/23191e18-532e-19cb-45bf-09f7461ae9d0/mza_9248153621676036701.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/62/b2/05/62b20574-65dd-5cda-0659-b324cf4d7f3b/mza_429407295969186171.jpg/600x600bb.jpg'
where slug = 'the-caf-bitcoin-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts122/v4/3e/66/6b/3e666b47-27fb-7a9e-bdcd-5149d51e0eb4/mza_8305760559014018886.jpg/600x600bb.jpg'
where slug = 'builders-in-bitcoin';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/20/99/4f/20994f56-a010-3062-9123-04954fce1026/mza_9896433765403520219.jpg/600x600bb.jpg'
where slug = 'one-love-bitcoin';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/e2/3c/41/e23c41fb-137b-7636-19e4-fb73e5370bda/mza_11519248190559325515.jpg/600x600bb.jpg'
where slug = 'pleb-underground';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/07/e5/73/07e5732f-63fe-d2a9-788f-78a8a41694ef/mza_14020591319546510942.jpg/600x600bb.jpg'
where slug = 'bitcoiners-live-from-bitcoin-beach';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/ab/36/7f/ab367f25-01e4-70d4-62ab-5e53cf126a7e/mza_2327051104557464659.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-matrix';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/68/3d/07/683d072d-336a-edf9-f315-6389cd15b8f9/mza_12062142927976934072.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-knowledge-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/ac/74/b5/ac74b5cd-b3fe-8fa2-3386-30ee105c8ad5/mza_12993657172932011999.jpg/600x600bb.jpg'
where slug = 'the-chaincode-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/b3/f5/13/b3f51385-f3e7-6731-8d2b-b95d1cb7c214/mza_701826207474278259.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-source-a-bitcoin-conversation';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/ff/4c/34/ff4c340a-784e-6dcb-8755-bf6fb61f9f40/mza_3859353608120732969.jpg/600x600bb.jpg'
where slug = 'bitcoin-in-africa-show';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts112/v4/dd/00/4a/dd004ad9-a2b5-d905-59f9-761309118e47/mza_8872129051801444337.jpg/600x600bb.jpg'
where slug = 'hell-money';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/7a/86/a0/7a86a038-0d7a-9228-e344-daf07a7aa9c8/mza_8938009913794332874.jpg/600x600bb.jpg'
where slug = 'energizing-bitcoin-ai';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/dc/18/62/dc18624d-40d9-54ab-04b6-7947a3754a3c/mza_1389732796377469668.jpg/600x600bb.jpg'
where slug = 'the-bitcoin-infinity-show';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/37/f8/6c/37f86c45-a371-5154-88b4-4316f09fa858/mza_4184879419401592809.jpg/600x600bb.jpg'
where slug = 'bitcast-everything-bitcoin';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/1b/65/39/1b653971-2414-9bee-d7f9-4b3030d65df7/mza_13811353991553943344.jpg/600x600bb.jpg'
where slug = 'the-canadian-bitcoiners-podcast-bitcoin-news-with-a-canadian-spin';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/9d/d9/60/9dd96097-725b-be30-4541-90f2e85c6f55/mza_11769037187183507672.jpg/600x600bb.jpg'
where slug = 'bitcoin-review-podcast-with-nvk-guests';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/55/c5/ee/55c5eeea-4f77-aa53-acbc-7030ebff33bd/mza_11396662361106773633.jpg/600x600bb.jpg'
where slug = '21st-capital';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/a3/71/15/a3711589-bc36-3f50-2636-529cf76bfc74/mza_901150328695603579.jpg/600x600bb.jpg'
where slug = 'the-path-to-bitcoin';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/d7/40/76/d7407632-7590-a27f-488b-7a797a95804c/mza_6129987442210831357.jpg/600x600bb.jpg'
where slug = '4-minute-bitcoin-daily-news';

