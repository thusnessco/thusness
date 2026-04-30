-- Curated /readings list (JSON in site_content). Created on first admin save if missing.
insert into public.site_content (key, title, content_json) values
(
  'readings_index',
  'Readings index',
  '{"items":[]}'::jsonb
)
on conflict (key) do nothing;
