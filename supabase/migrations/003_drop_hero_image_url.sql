-- Remove note cover column if a prior revision of 002 added it
alter table public.notes drop column if exists hero_image_url;
