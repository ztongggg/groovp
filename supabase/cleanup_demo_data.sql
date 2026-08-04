-- ============================================================
-- Groovp — demo/test data cleanup   ⚠️ DESTRUCTIVE. Review before running.
-- Run in the Supabase SQL Editor (service role bypasses RLS).
-- Deleting an auth user cascades to their profile, projects, groups,
-- memberships, requests, ratings, messages, etc.
-- ============================================================

-- 1) See what you have first (run this alone, decide what to keep):
--    select id, username, full_name, email from public.profiles order by created_at;
--    select id, name, join_code from public.projects order by created_at;

-- ------------------------------------------------------------
-- 2) Remove obvious JUNK accounts (edit the list to taste).
--    This cascades away their projects/groups/etc.
-- ------------------------------------------------------------
delete from auth.users
 where email in (
   -- add/remove emails here; these are the throwaway ones seen in testing:
   'test@sutd.edu.sg',
   'testing2@sutd.edu.sg',
   'yar@sutd.edu.sg'
 );

-- Also clear any profiles with no username (broken pre-migration rows):
delete from auth.users u
 using public.profiles p
 where p.id = u.id and (p.username is null or p.username = '');

-- ------------------------------------------------------------
-- 3) Remove JUNK projects owned by accounts you're keeping.
-- ------------------------------------------------------------
delete from public.projects where name in ('thing', 'Testing1', 'Test');

-- ------------------------------------------------------------
-- 4) OPTIONAL — full clean slate. Uncomment to also remove the demo
--    accounts (flowtest1 + onboard set) and their content.
--    Leave commented if you want them for your presentation.
-- ------------------------------------------------------------
-- delete from auth.users where email in (
--   'flowtest1@sutd.edu.sg',
--   'onboard1@sutd.edu.sg','onboard2@sutd.edu.sg','onboard3@sutd.edu.sg','onboard4@sutd.edu.sg'
-- );

-- 5) Verify:
--    select username, full_name from public.profiles order by created_at;
--    select name, join_code from public.projects order by created_at;
