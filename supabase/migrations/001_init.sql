-- Thusness: site_content + notes with RLS
-- Run in Supabase SQL Editor (or supabase db push).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.site_content (
  key text primary key,
  title text,
  content_json jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null default '',
  excerpt text,
  content_json jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_published_published_at_idx
  on public.notes (published, published_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.handle_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.site_content enable row level security;
alter table public.notes enable row level security;

-- site_content: public read (homepage), authenticated write
drop policy if exists "site_content_select_public" on public.site_content;
create policy "site_content_select_public"
  on public.site_content for select
  using (true);

drop policy if exists "site_content_write_authenticated" on public.site_content;
create policy "site_content_write_authenticated"
  on public.site_content for all
  to authenticated
  using (true)
  with check (true);

-- notes: anyone can read published; authenticated full access
drop policy if exists "notes_select_published" on public.notes;
create policy "notes_select_published"
  on public.notes for select
  using (published = true);

drop policy if exists "notes_select_authenticated" on public.notes;
create policy "notes_select_authenticated"
  on public.notes for select
  to authenticated
  using (true);

drop policy if exists "notes_insert_authenticated" on public.notes;
create policy "notes_insert_authenticated"
  on public.notes for insert
  to authenticated
  with check (true);

drop policy if exists "notes_update_authenticated" on public.notes;
create policy "notes_update_authenticated"
  on public.notes for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "notes_delete_authenticated" on public.notes;
create policy "notes_delete_authenticated"
  on public.notes for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Seed: site_content
-- ---------------------------------------------------------------------------

insert into public.site_content (key, title, content_json) values
(
  'home_intro',
  null,
  $json${
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "marks": [{ "type": "bold" }], "text": "Friday April 17, 2028" }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Theme" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Noticing experience. Noticing can often turn into a habituated pattern. When this happens, much of experience tends to remain undiscovered or under appreciated. "
          },
          { "type": "text", "marks": [{ "type": "bold" }], "text": "GROUNDHOG DAY! " },
          {
            "type": "text",
            "text": "We might look to change the circumstances to shift the experience… but what happens if we change the pattern of noticing? Today we’ll explore some fresh ways to notice experience, and see what might come forward."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Benefits / goals" }]
      },
      {
        "type": "orderedList",
        "attrs": { "start": 1 },
        "content": [
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [{ "type": "text", "text": "Learn and practice a new way of noticing our experience" }]
              }
            ]
          },
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [{ "type": "text", "text": "Explore the 3 Pillars of Success" }]
              }
            ]
          },
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [{ "type": "text", "text": "Notice something subtly new" }]
              }
            ]
          },
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "Notice, expand, perpetuate, and integrate an aspect of experience you’d like to have more of"
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
                        "content": [
                          {
                            "type": "text",
                            "text": "Peace, stillness, love, clarity, acceptance, silence, okayness, completeness etc."
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "3 Pillars of Success" }]
      },
      {
        "type": "bulletList",
        "content": [
          {
            "type": "listItem",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "Curiosity / Openness" }] }
            ]
          },
          {
            "type": "listItem",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "Effortlessness" }] }
            ]
          },
          {
            "type": "listItem",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "Appreciation" }] }
            ]
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Challenges" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "If something feels tense, unwanted, or challenging, proceed gently and slowly, and check for the 3 Pillars of Success. See if there is curiosity about that challenging aspect, effortlessly notice it, see if could be gently explored via attention, even welcomed, and appreciated. If you also have access to a desired positive quality, you may experiment with inviting that quality into the challenge or vice versa."
          }
        ]
      },
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Itinerary" }]
      },
      {
        "type": "orderedList",
        "attrs": { "start": 1 },
        "content": [
          {
            "type": "listItem",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "Noticing where attention goes" }] }
            ]
          },
          {
            "type": "listItem",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "Checking for the 3 pillars" }] }
            ]
          },
          {
            "type": "listItem",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "Exploring senses" }] }
            ]
          },
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [{ "type": "text", "text": "Exploring peace, stillness, love, or a desired quality" }]
              }
            ]
          },
          {
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [{ "type": "text", "text": "Expanding / Perpetuating a quality via simple noticing" }]
              }
            ]
          },
          {
            "type": "listItem",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "Integration of quality" }] }
            ]
          },
          {
            "type": "listItem",
            "content": [
              { "type": "paragraph", "content": [{ "type": "text", "text": "Group sharing" }] }
            ]
          }
        ]
      }
    ]
  }$json$::jsonb
),
(
  'weekly_sessions',
  null,
  $json${
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 2 },
        "content": [{ "type": "text", "text": "Weekly sessions" }]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "A quiet rhythm for returning: small groups and one-to-one work, held with the same simplicity you see here. Details and booking live off-site; this space stays uncluttered."
          }
        ]
      }
    ]
  }$json$::jsonb
)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Seed: notes (3 samples)
-- ---------------------------------------------------------------------------

insert into public.notes (slug, title, excerpt, content_json, published, published_at) values
(
  'effortlessness-and-control',
  'Effortlessness and control',
  'When trying drops away, something quieter can take the lead—without collapsing into passivity.',
  $json${
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "There is a familiar oscillation: either I am steering hard, or I have given up and gone slack. Neither quite fits what we touched on today."
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "What if control and effortlessness are not opposites in the way the mind assumes? What if “doing” can lighten without the whole scene falling apart?"
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "We stayed with small moments—typing, walking, listening—where the grip shows itself first. Not to fix the grip, only to see its temperature and texture. From there, the same action sometimes continues with less commentary, as though the body already knew how."
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Nothing to prove here. Just a record: the day leaned toward less forcing, and the world did not end."
          }
        ]
      }
    ]
  }$json$::jsonb,
  true,
  '2026-03-18 12:00:00+00'
),
(
  'noticing-resistance',
  'Noticing resistance',
  'Resistance appeared as tightening, skipping, and a low story about how this should already be different.',
  $json${
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Resistance rarely arrives with a label. Today it came as a slight narrowing behind the eyes, a reluctance to stay with one more breath, and a quiet argument that something else deserved attention."
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "We did not negotiate with it as an enemy. We let it be named in a plain way—tension, avoidance, the small “no”—and watched how it behaved when it was not chased."
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "What stood out was how quickly resistance softens when it is allowed to exist without being turned into a project. Not always. Not forever. But often enough to be worth remembering."
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "This note is a bookmark for that ordinary afternoon when the floor felt steadier after the noticing widened, even a little."
          }
        ]
      }
    ]
  }$json$::jsonb,
  true,
  '2026-02-04 12:00:00+00'
),
(
  'as-it-is',
  'As it is',
  'Starting where things are—not as resignation, but as an honest coordinate for inquiry.',
  $json${
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "We began where we always begin, which is here: sound in the room, weight in the chair, the hum of thinking doing what thinking does."
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "“As it is” is easy to repeat and hard to mean. Today it meant pausing the habit of gently bullying experience into a better shape before looking."
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "What showed up was not dramatic. Colors a little clearer. Silence with more room in it. A sense that the narrative could arrive a half-step later and nothing would be lost."
          }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "If someone reads this later and wonders what happened in the session, the honest answer is: not much, in the best sense. A few minutes of not lying to oneself about what was already present."
          }
        ]
      }
    ]
  }$json$::jsonb,
  true,
  '2026-01-12 12:00:00+00'
)
on conflict (slug) do nothing;
