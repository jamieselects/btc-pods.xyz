-- Denormalized subscription counts for sorting the public podcast library.
-- Subscriptions use owner-only RLS, so aggregate counts cannot be read via the
-- anon/authenticated API client; triggers keep this column in sync.

alter table public.podcasts
  add column if not exists subscription_count integer not null default 0;

update public.podcasts p
set subscription_count = coalesce(
  (select count(*)::integer from public.subscriptions s where s.podcast_id = p.id),
  0
);

create or replace function public.adjust_podcast_subscription_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.podcasts
    set subscription_count = subscription_count + 1
    where id = new.podcast_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.podcasts
    set subscription_count = greatest(0, subscription_count - 1)
    where id = old.podcast_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists subscriptions_adjust_podcast_count on public.subscriptions;

create trigger subscriptions_adjust_podcast_count
  after insert or delete on public.subscriptions
  for each row
  execute function public.adjust_podcast_subscription_count();
