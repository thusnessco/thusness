-- Published weeks: full TipTap body per row; public read, authenticated write.

create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  week_of date not null,
  theme_title text not null default '',
  question text not null default '',
  body_json jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists weeks_week_of_desc_idx
  on public.weeks (week_of desc);

drop trigger if exists weeks_set_updated_at on public.weeks;
create trigger weeks_set_updated_at
  before update on public.weeks
  for each row execute function public.handle_updated_at();

alter table public.weeks enable row level security;

drop policy if exists "weeks_select_public" on public.weeks;
create policy "weeks_select_public"
  on public.weeks for select
  using (true);

drop policy if exists "weeks_write_authenticated" on public.weeks;
create policy "weeks_write_authenticated"
  on public.weeks for all
  to authenticated
  using (true)
  with check (true);

-- Starter row so a fresh project has something to edit (replace in Admin).
insert into public.weeks (slug, week_of, theme_title, question, body_json)
values (
  'welcome',
  '2026-01-06',
  'Welcome',
  'Edit this week in Admin — lists and headings match the live site.',
  $json${
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Thusness" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "This page is stored in Supabase. Use the toolbar for headings, bullet lists, and links. What you see here is what visitors see on the home page."
          }
        ]
      },
      {
        "type": "bulletList",
        "content": [
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [{ "type": "text", "text": "Add a new week in Admin when you are ready for the next theme." }]
              }
            ]
          },
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [{ "type": "text", "text": "Older weeks appear automatically under /notes." }]
              }
            ]
          }
        ]
      }
    ]
  }$json$::jsonb
)
on conflict (slug) do nothing;
