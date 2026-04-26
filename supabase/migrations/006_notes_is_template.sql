-- Reusable TipTap layouts: admin can mark a note as a template and spawn drafts from it.

alter table public.notes
  add column if not exists is_template boolean not null default false;

comment on column public.notes.is_template is
  'When true, note appears in Admin “New from template” and is hidden from the public /notes index (still pin-able to /).';
