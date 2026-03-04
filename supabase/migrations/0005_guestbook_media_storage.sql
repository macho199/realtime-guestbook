insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guestbook-media',
  'guestbook-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can read guestbook media'
  ) then
    create policy "Public can read guestbook media"
      on storage.objects
      for select
      to public
      using (bucket_id = 'guestbook-media');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can upload guestbook media'
  ) then
    create policy "Public can upload guestbook media"
      on storage.objects
      for insert
      to anon, authenticated
      with check (bucket_id = 'guestbook-media');
  end if;
end;
$$;
