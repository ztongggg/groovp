-- ============================================================
-- Groovp schema v8 — cover_image (wide project banner, spec §2)
-- Separate from `photo` (rounded-square, schema_v7): cover_image is
-- the wide banner shown on Discover/Home cards and Project Details.
-- Safe to re-run. Paste into Supabase SQL Editor.
-- ============================================================

alter table public.projects add column if not exists cover_image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-covers', 'project-covers', true, 5242880, array['image/jpeg','image/png'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "pcovers_insert" on storage.objects;
create policy "pcovers_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'project-covers');
drop policy if exists "pcovers_delete" on storage.objects;
create policy "pcovers_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'project-covers' and owner = auth.uid());
