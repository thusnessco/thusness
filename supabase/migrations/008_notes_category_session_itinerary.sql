-- Add session_itinerary to allowed note categories.

alter table public.notes
  drop constraint if exists notes_category_check;

alter table public.notes
  add constraint notes_category_check
  check (
    category is null
    or category in (
      'session_helpers',
      'session_itinerary',
      'short_quotes',
      'long_posts'
    )
  );

comment on column public.notes.category is
  'Optional: session_helpers | session_itinerary | short_quotes | long_posts. Null = uncategorized.';
