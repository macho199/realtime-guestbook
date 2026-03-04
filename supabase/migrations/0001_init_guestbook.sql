create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  author text not null check (char_length(trim(author)) between 1 and 30),
  message text not null check (char_length(trim(message)) between 1 and 160),
  media_url text,
  media_type text not null check (media_type in ('image', 'drawing')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger guestbook_set_updated_at
before update on public.guestbook
for each row execute function public.set_updated_at();

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.guestbook(id) on delete cascade,
  author text not null check (char_length(trim(author)) between 1 and 30),
  content text not null check (char_length(trim(content)) between 1 and 500),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_guestbook_created_at on public.guestbook(created_at desc);
create index if not exists idx_comments_post_created_at on public.comments(post_id, created_at asc);

alter table public.guestbook enable row level security;
alter table public.comments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'guestbook' and policyname = 'Public can read guestbook'
  ) then
    create policy "Public can read guestbook"
      on public.guestbook
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'guestbook' and policyname = 'Public can insert guestbook'
  ) then
    create policy "Public can insert guestbook"
      on public.guestbook
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'guestbook' and policyname = 'Public can update guestbook'
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
    where schemaname = 'public' and tablename = 'guestbook' and policyname = 'Public can delete guestbook'
  ) then
    create policy "Public can delete guestbook"
      on public.guestbook
      for delete
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'comments' and policyname = 'Public can read comments'
  ) then
    create policy "Public can read comments"
      on public.comments
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'comments' and policyname = 'Public can insert comments'
  ) then
    create policy "Public can insert comments"
      on public.comments
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'comments' and policyname = 'Public can update comments'
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
    where schemaname = 'public' and tablename = 'comments' and policyname = 'Public can delete comments'
  ) then
    create policy "Public can delete comments"
      on public.comments
      for delete
      to anon, authenticated
      using (true);
  end if;
end;
$$;
