-- RSS <item><link> — publisher episode page (often opens in-browser app choosers).
alter table public.episodes
  add column if not exists source_link text;
