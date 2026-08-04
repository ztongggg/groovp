-- ============================================================
-- Groovp schema v6 (additive) — logic hardening
--   1. one rating per (rater, ratee)
--   2. let group leaders sync the project roster on accept
-- Safe to run more than once. Paste into Supabase SQL Editor.
-- ============================================================

-- ---------- 1. ONE RATING PER PAIR ----------
-- Remove any existing duplicates first (keep the most recent), then enforce.
delete from public.ratings r
 using public.ratings r2
 where r.rater_id = r2.rater_id
   and r.ratee_id = r2.ratee_id
   and r.created_at < r2.created_at;

create unique index if not exists ratings_rater_ratee_uniq
  on public.ratings (rater_id, ratee_id);

-- ---------- 2. ROSTER SYNC ON ACCEPT ----------
-- pmembers_write only lets you add yourself. When a leader accepts an applicant
-- into a group, the app also adds that applicant to the project roster — allow
-- inserting a roster row for anyone who is already in a group of that project.
drop policy if exists "pmembers_via_group" on public.project_members;
create policy "pmembers_via_group" on public.project_members for insert to authenticated
  with check (exists (
    select 1
      from public.group_members gm
      join public.groups g on g.id = gm.group_id
     where g.project_id = project_members.project_id
       and gm.user_id   = project_members.user_id
  ));
