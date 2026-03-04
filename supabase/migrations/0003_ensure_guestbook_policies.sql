do $$
begin
  if to_regclass('public.guestbook') is not null then
    alter table public.guestbook enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='guestbook' and policyname='Public can read guestbook'
    ) then
      create policy "Public can read guestbook"
        on public.guestbook
        for select
        to anon, authenticated
        using (true);
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='guestbook' and policyname='Public can insert guestbook'
    ) then
      create policy "Public can insert guestbook"
        on public.guestbook
        for insert
        to anon, authenticated
        with check (true);
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='guestbook' and policyname='Public can update guestbook'
    ) then
      create policy "Public can update guestbook"
        on public.guestbook
        for update
        to anon, authenticated
        using (true)
        with check (true);
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='guestbook' and policyname='Public can delete guestbook'
    ) then
      create policy "Public can delete guestbook"
        on public.guestbook
        for delete
        to anon, authenticated
        using (true);
    end if;
  end if;

  if to_regclass('public.comments') is not null then
    alter table public.comments enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='comments' and policyname='Public can read comments'
    ) then
      create policy "Public can read comments"
        on public.comments
        for select
        to anon, authenticated
        using (true);
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='comments' and policyname='Public can insert comments'
    ) then
      create policy "Public can insert comments"
        on public.comments
        for insert
        to anon, authenticated
        with check (true);
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='comments' and policyname='Public can update comments'
    ) then
      create policy "Public can update comments"
        on public.comments
        for update
        to anon, authenticated
        using (true)
        with check (true);
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname='public' and tablename='comments' and policyname='Public can delete comments'
    ) then
      create policy "Public can delete comments"
        on public.comments
        for delete
        to anon, authenticated
        using (true);
    end if;
  end if;
end;
$$;
