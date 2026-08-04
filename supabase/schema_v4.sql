-- ============================================================
-- Groovp schema v4 (additive) — project share codes + roster + LinkedIn verify
-- Safe to run more than once. Paste into Supabase SQL Editor.
-- ============================================================

-- ---------- SHARE CODE (per project) ----------
alter table public.projects add column if not exists join_code text unique;

-- Backfill any existing projects that have no code yet.
-- GRV- + 5 uppercased base36-ish chars from md5(random()).
update public.projects
   set join_code = 'GRV-' || upper(substr(md5(random()::text), 1, 5))
 where join_code is null;

-- ---------- PROJECT ROSTER (who has joined a project) ----------
create table if not exists public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  joined_at  timestamptz default now(),
  primary key (project_id, user_id)
);
alter table public.project_members enable row level security;

-- Read all (needed to show roster counts); insert only yourself.
drop policy if exists "pmembers_read"  on public.project_members;
drop policy if exists "pmembers_write" on public.project_members;
create policy "pmembers_read"  on public.project_members for select to authenticated using (true);
create policy "pmembers_write" on public.project_members for all    to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Backfill: every existing group member is implicitly a project member.
insert into public.project_members (project_id, user_id)
select g.project_id, gm.user_id
  from public.group_members gm
  join public.groups g on g.id = gm.group_id
on conflict do nothing;

-- Project owners are members of their own project.
insert into public.project_members (project_id, user_id)
select p.id, p.owner_id from public.projects p
on conflict do nothing;

-- ---------- LINKEDIN VERIFICATION ----------
alter table public.profiles add column if not exists linkedin_verified boolean default false;
alter table public.profiles add column if not exists linkedin_sub      text;
