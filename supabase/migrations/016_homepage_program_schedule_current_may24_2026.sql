-- Homepage program card (4-week noticing): update to the current upcoming window
-- as of Sun May 24, 2026.
--
-- Keep 4 rows total, put the next current session at the top, and set progress
-- to week 4 of 4:
--   Week 4 · Guided Noticing · Wed · May 27
--   Week 4 · Guided Noticing · Fri · May 29
--   Week 4 · Guided Noticing · Wed · Jun 03
--   Week 4 · Guided Noticing · Fri · Jun 05

with new_rows as (
  select jsonb_build_array(
    jsonb_build_object(
      'type', 'thusnessProgramRow',
      'content', jsonb_build_array(
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Week 4'))),
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Guided Noticing'))),
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Wed · May 27')))
      )
    ),
    jsonb_build_object(
      'type', 'thusnessProgramRow',
      'content', jsonb_build_array(
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Week 4'))),
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Guided Noticing'))),
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Fri · May 29')))
      )
    ),
    jsonb_build_object(
      'type', 'thusnessProgramRow',
      'content', jsonb_build_array(
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Week 4'))),
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Guided Noticing'))),
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Wed · Jun 03')))
      )
    ),
    jsonb_build_object(
      'type', 'thusnessProgramRow',
      'content', jsonb_build_array(
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Week 4'))),
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Guided Noticing'))),
        jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(jsonb_build_object('type', 'text', 'text', 'Fri · Jun 05')))
      )
    )
  ) as rows
),
updated_notes as (
  select
    n.id,
    jsonb_set(
      n.content_json,
      '{content}',
      (
        select jsonb_agg(
          case
            when node->>'type' = 'thusnessProgramCard' then
              jsonb_set(
                node,
                '{content}',
                (
                  select jsonb_agg(piece order by sort_key, ord)
                  from (
                    select
                      e.elem as piece,
                      e.ord::numeric as sort_key,
                      e.ord
                    from jsonb_array_elements(node->'content') with ordinality as e(elem, ord)
                    where e.ord <= 2

                    union all

                    select
                      jsonb_set(
                        e.elem,
                        '{content,0,text}',
                        to_jsonb('week 4 of 4'::text),
                        true
                      ) as piece,
                      3::numeric as sort_key,
                      e.ord
                    from jsonb_array_elements(node->'content') with ordinality as e(elem, ord)
                    where e.ord = 3

                    union all

                    select
                      r.row as piece,
                      (3 + r.ord / 10.0)::numeric as sort_key,
                      r.ord
                    from new_rows
                    cross join jsonb_array_elements(new_rows.rows) with ordinality as r(row, ord)

                    union all

                    select
                      e.elem as piece,
                      (1000 + e.ord)::numeric as sort_key,
                      e.ord
                    from jsonb_array_elements(node->'content') with ordinality as e(elem, ord)
                    where e.ord > 3
                      and e.elem->>'type' <> 'thusnessProgramRow'
                  ) pieces
                )
              )
            else node
          end
          order by node_ord
        )
        from jsonb_array_elements(n.content_json->'content') with ordinality as top_nodes(node, node_ord)
      )
    ) as next_content_json
  from public.notes n
  where n.content_json::text ilike '%thusnessProgramCard%'
)
update public.notes n
set content_json = u.next_content_json
from updated_notes u
where n.id = u.id;
