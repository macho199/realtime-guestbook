do $$
begin
  if to_regclass('public.posts') is not null and to_regclass('public.guestbook') is null then
    alter table public.posts rename to guestbook;
  end if;
end;
$$;

do $$
begin
  if to_regclass('public.guestbook') is not null then
    if to_regclass('public.idx_posts_created_at') is not null then
      alter index public.idx_posts_created_at rename to idx_guestbook_created_at;
    end if;

    if exists (
      select 1
      from information_schema.triggers
      where trigger_schema = 'public'
        and event_object_table = 'guestbook'
        and trigger_name = 'posts_set_updated_at'
    ) then
      alter trigger posts_set_updated_at on public.guestbook rename to guestbook_set_updated_at;
    end if;

    if exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'guestbook' and policyname = 'Public can read posts'
    ) then
      alter policy "Public can read posts" on public.guestbook rename to "Public can read guestbook";
    end if;

    if exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'guestbook' and policyname = 'Public can insert posts'
    ) then
      alter policy "Public can insert posts" on public.guestbook rename to "Public can insert guestbook";
    end if;

    if exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'guestbook' and policyname = 'Public can update posts'
    ) then
      alter policy "Public can update posts" on public.guestbook rename to "Public can update guestbook";
    end if;

    if exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'guestbook' and policyname = 'Public can delete posts'
    ) then
      alter policy "Public can delete posts" on public.guestbook rename to "Public can delete guestbook";
    end if;
  end if;
end;
$$;
