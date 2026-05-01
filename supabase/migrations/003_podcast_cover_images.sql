-- Curated podcast cover art (Apple Podcasts / iTunes CDN, 600×600).
-- Safe to re-run: idempotent per slug.

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/fb/ff/bb/fbffbba3-1a5b-0759-fa35-cafc42f214c9/mza_4444412895211887709.jpg/600x600bb.jpg'
where slug = 'what-bitcoin-did';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/ed/fb/80/edfb8088-08fb-adfc-3a0e-89a216d0cb0a/mza_546663195369372323.jpg/600x600bb.jpg'
where slug = 'stephan-livera-podcast';

update public.podcasts
set cover_image_url = 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/31/0e/0a/310e0aa0-cf1d-1bc1-d70f-cd2b1587479b/mza_16076379444068520811.jpg/600x600bb.jpg'
where slug = 'the-hurdle-rate';
