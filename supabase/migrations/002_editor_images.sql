-- Public bucket for TipTap inline images (JPEG/PNG/WebP/GIF, 5MB cap in bucket config)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'editor-assets',
  'editor-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS (idempotent)
drop policy if exists "editor_assets_select" on storage.objects;
create policy "editor_assets_select"
  on storage.objects for select
  using (bucket_id = 'editor-assets');

drop policy if exists "editor_assets_insert_authenticated" on storage.objects;
create policy "editor_assets_insert_authenticated"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'editor-assets');

drop policy if exists "editor_assets_update_authenticated" on storage.objects;
create policy "editor_assets_update_authenticated"
  on storage.objects for update to authenticated
  using (bucket_id = 'editor-assets')
  with check (bucket_id = 'editor-assets');

drop policy if exists "editor_assets_delete_authenticated" on storage.objects;
create policy "editor_assets_delete_authenticated"
  on storage.objects for delete to authenticated
  using (bucket_id = 'editor-assets');
