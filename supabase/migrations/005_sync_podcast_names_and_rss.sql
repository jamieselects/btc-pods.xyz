-- Align `name` and `rss_url` with each feed's current <channel><title> and canonical RSS URLs
-- (Apple Podcasts / directory sources). Keeps the catalog consistent with what the parser ingests.

update public.podcasts
set
  name = 'What Bitcoin Did',
  rss_url = 'https://feeds.fountain.fm/UZSKQcrOnhqYS1JopxGg'
where slug = 'what-bitcoin-did';

update public.podcasts
set
  name = 'Stephan Livera Podcast',
  rss_url = 'https://anchor.fm/s/7d083a4/podcast/rss'
where slug = 'stephan-livera-podcast';

update public.podcasts
set
  name = 'The Hurdle Rate Podcast',
  rss_url = 'https://feed.podbean.com/thehurdleratepod/feed.xml'
where slug = 'the-hurdle-rate';

update public.podcasts
set name = 'The Bitcoin Standard Podcast'
where slug = 'bitcoin-standard-podcast';

update public.podcasts
set name = 'The Jack Mallers Show'
where slug = 'the-jack-mallers-show';

update public.podcasts
set name = 'Coin Stories with Natalie Brunell'
where slug = 'coin-stories';

update public.podcasts
set name = 'The Pomp Podcast'
where slug = 'the-pomp-podcast';

update public.podcasts
set name = 'TFTC: A Bitcoin Podcast'
where slug = 'tftc';

update public.podcasts
set name = 'Mr. M Podcast | Maurizio Pedrazzoli Grazioli'
where slug = 'mr-m-podcast';

update public.podcasts
set name = 'Onramp Bitcoin Media'
where slug = 'onramp';

update public.podcasts
set name = 'The Bitcoin Way Podcast'
where slug = 'the-bitcoin-way-podcast';
