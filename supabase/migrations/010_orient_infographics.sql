-- Row for editable Orient diagram copy (merged with bundled defaults in code).
insert into public.site_content (key, title, content_json)
values ('orient_infographics', 'Orient infographics', '{}'::jsonb)
on conflict (key) do nothing;
