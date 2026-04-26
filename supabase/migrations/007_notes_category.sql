-- Optional grouping for notes (admin list + public /notes filter).

alter table public.notes
  add column if not exists category text null;

alter table public.notes
  drop constraint if exists notes_category_check;

alter table public.notes
  add constraint notes_category_check
  check (
    category is null
    or category in ('session_helpers', 'short_quotes', 'long_posts')
  );

comment on column public.notes.category is
  'Optional: session_helpers | short_quotes | long_posts. Null = uncategorized.';

create index if not exists notes_published_category_idx
  on public.notes (published, category)
  where published = true;
