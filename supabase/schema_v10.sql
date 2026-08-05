-- ============================================================
-- Groovp schema v10 — onboarding tour flag, 2 more notification prefs,
-- ratings per-project uniqueness. schema_v9.sql already deployed, this
-- is additive on top, not a replacement.
-- Safe to re-run. Paste into Supabase SQL Editor.
-- ============================================================

-- ---------- 1. ONBOARDING TOUR ----------
-- default true so EXISTING users are never shown the tour retroactively
-- (spec: "backfill existing users to true at rollout"). signUpFull()
-- explicitly sets this to false for brand-new signups only.
alter table public.profiles add column if not exists has_completed_onboarding_tour boolean default true;

-- ---------- 2. 2 MORE NOTIFICATION PREFS ----------
alter table public.profiles add column if not exists notify_new_message  boolean default true;
alter table public.profiles add column if not exists notify_rate_reminder boolean default true;

-- ---------- 3. RATINGS: per-project uniqueness ----------
-- Spec: "One Rating per (rater, ratee, project) triple." Live index (from
-- schema_v6) only enforced (rater_id, ratee_id) globally. Widening to include
-- project_id lets the same pair be rated once per shared ended project instead
-- of once ever. Historical rows (project_id always null before this pass) are
-- untouched — going forward the app always supplies a real project_id.
drop index if exists ratings_rater_ratee_uniq;
create unique index if not exists ratings_rater_ratee_project_uniq
  on public.ratings (rater_id, ratee_id, project_id);
