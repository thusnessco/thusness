-- Rename orient movement section when DB still has bundled / legacy titles.
update public.site_content
set
  content_json = jsonb_set(
    jsonb_set(
      content_json,
      '{movement,title}',
      '"From Solidity to Relationship"'::jsonb
    ),
    '{movement,kicker}',
    '"~ From solidity to relationship"'::jsonb
  ),
  updated_at = now()
where key = 'orient_infographics'
  and (
    coalesce(content_json->'movement'->>'title', '') ilike '%movement%progression%'
    or coalesce(content_json->'movement'->>'title', '') = 'Precise seeing is possible.'
    or coalesce(content_json->'movement'->>'kicker', '') ilike '%movement%progression%'
    or coalesce(content_json->'movement'->>'kicker', '') = '~ With sustained peaceful stability'
  );
