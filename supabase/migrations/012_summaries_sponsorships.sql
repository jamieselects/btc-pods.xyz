-- Episode sponsorship callouts (separate from editorial summary sections).
alter table public.summaries
  add column if not exists sponsorships text;

comment on column public.summaries.sponsorships is
  'Sponsor reads from the episode with product links, for attribution.';
