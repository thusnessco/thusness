-- Replace legacy Zoom meeting URL with public scheduling link everywhere it appears
-- in stored JSON (notes bodies, homepage pin, other site_content).

update public.notes
set content_json =
      replace(content_json::text, 'https://zoom.us/j/97461285343', 'https://thusness.as.me/')
        ::jsonb,
    updated_at = now()
where content_json::text like '%https://zoom.us/j/97461285343%';

update public.site_content
set content_json =
      replace(content_json::text, 'https://zoom.us/j/97461285343', 'https://thusness.as.me/')
        ::jsonb,
    updated_at = now()
where content_json::text like '%https://zoom.us/j/97461285343%';
