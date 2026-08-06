-- ============================================================
-- Groovp schema v11 — additive. Run in the Supabase SQL editor.
-- Safe to re-run (all statements are idempotent).
--
-- Backs the owner decisions taken on 2026-08-07:
--   * Delete Project = soft-archive, never a cascading hard delete.
-- ============================================================

-- ---------- PROJECT SOFT-ARCHIVE ----------
-- Deleting a project hides it from every feed but leaves groups, memberships,
-- chat history and past-project records untouched, so members never silently
-- lose a conversation they took part in.
alter table public.projects
  add column if not exists status text default 'Active';

alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects
  add constraint projects_status_check check (status in ('Active', 'Deleted'));

alter table public.projects
  add column if not exists deleted_at timestamptz;

-- Existing rows predate the column; make the default explicit rather than null.
update public.projects set status = 'Active' where status is null;

create index if not exists projects_status_idx on public.projects (status);
