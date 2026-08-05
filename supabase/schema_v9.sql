-- ============================================================
-- Groovp schema v9 — Academic group-count field, notification prefs,
-- and the 2 concrete Privacy toggles (spec's Privacy screen).
-- Safe to re-run. Paste into Supabase SQL Editor.
-- ============================================================

-- ---------- 1. ACADEMIC: user-set number of groups ----------
-- allow_multiple_groups (boolean) already existed, auto-derived from type.
-- Spec wants an actual count for Academic projects, not just a yes/no.
alter table public.projects add column if not exists number_of_groups int default 1;

-- ---------- 2. NOTIFICATION PREFERENCES ----------
-- One boolean per notification type currently in the app (see app/*/actions.js
-- insert-into-notifications call sites). All default true — opt-out, not opt-in.
alter table public.profiles add column if not exists notify_join_requests boolean default true;  -- "new_join_requests" (leader)
alter table public.profiles add column if not exists notify_join_accepted boolean default true;  -- "join_accepted" (applicant or leader on auto-join)
alter table public.profiles add column if not exists notify_invites       boolean default true;  -- "invite" (invitee)

-- ---------- 3. PRIVACY: the 2 concrete, enforceable toggles ----------
-- Scoped deliberately to just these 2 — the Figma also showed a 3-tier profile
-- visibility selector (Public/Teammates-only/Private) that has no spec guidance
-- on enforcement scope (which queries would need to filter by it), so that part
-- is NOT built — flagged for an owner decision, not guessed at.
alter table public.profiles add column if not exists show_ratings_publicly boolean default true;
alter table public.profiles add column if not exists allow_message_first  boolean default true;
