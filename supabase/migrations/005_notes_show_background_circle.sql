-- Optional decorative ring behind the note body (public /notes and / when pinned).

alter table public.notes
  add column if not exists show_background_circle boolean not null default false;

comment on column public.notes.show_background_circle is
  'When true, public note layout shows a thin circle behind the article body.';
