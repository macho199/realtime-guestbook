do $$
begin
  if to_regclass('public.guestbook') is null then
    return;
  end if;

  alter table public.guestbook add column if not exists message text;
  alter table public.guestbook add column if not exists media_url text;
  alter table public.guestbook add column if not exists media_type text;
  alter table public.guestbook add column if not exists updated_at timestamptz not null default timezone('utc', now());

  update public.guestbook
  set message = coalesce(nullif(message, ''), content, '')
  where message is null;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'guestbook_media_type_check'
      and conrelid = 'public.guestbook'::regclass
  ) then
    alter table public.guestbook
      add constraint guestbook_media_type_check check (media_type in ('image', 'drawing') or media_type is null);
  end if;

  if exists (
    select 1
    from pg_proc
    where proname = 'set_updated_at'
      and pronamespace = 'public'::regnamespace
  ) and not exists (
    select 1
    from information_schema.triggers
    where trigger_schema = 'public'
      and event_object_table = 'guestbook'
      and trigger_name = 'guestbook_set_updated_at'
  ) then
    create trigger guestbook_set_updated_at
    before update on public.guestbook
    for each row execute function public.set_updated_at();
  end if;
end;
$$;
