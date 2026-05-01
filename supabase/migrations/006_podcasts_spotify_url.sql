-- Optional Spotify show URL (directory link; RSS remains source of truth for ingestion).

alter table public.podcasts
  add column if not exists spotify_url text;

-- What Bitcoin Did: Danny Knowles is the current host (RSS itunes:author + Spotify listing).
update public.podcasts
set
  tagline = 'What Bitcoin Did unpacks Bitcoin''s role in reshaping money, freedom, and the future of finance.',
  description = 'Long-form interviews hosted by Danny Knowles on Bitcoin, money, culture, and politics. Many episodes ship full transcripts in the RSS feed.',
  twitter_handle = '_DannyKnowles',
  spotify_url = 'https://open.spotify.com/show/18Pixm6jNMATYXSO6cUnTH'
where slug = 'what-bitcoin-did';
