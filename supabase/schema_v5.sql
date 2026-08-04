-- ============================================================
-- Groovp schema v5 (additive) — GitHub verification (alongside LinkedIn)
-- Safe to run more than once. Paste into Supabase SQL Editor.
-- ============================================================

alter table public.profiles add column if not exists github_verified boolean default false;
alter table public.profiles add column if not exists github_username text;
