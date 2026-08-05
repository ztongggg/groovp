-- ============================================================
-- Groovp schema v7 — backend spec v2 adoption (2026-08-05)
-- Renames/tightens enums that already have live data, adds
-- multi-university support, adds reapply-cooldown tracking.
-- Safe to re-run. Paste into Supabase SQL Editor.
--
-- BEFORE RUNNING: review the two SELECT previews below (interests
-- cleanup, gender cleanup) to see exactly which rows will change.
-- ============================================================

-- ---------- PREVIEW: which rows lose an interest value not in the new set of 9 ----------
-- select id, interests from public.profiles
--  where not (interests <@ array['Sustainability','EdTech','Web Dev','Healthcare','Data Science','Social Impact','Robotics','AI & ML','Design']::text[]);

-- ---------- PREVIEW: which profiles have gender = 'Non-binary' (will become 'Prefer not to say') ----------
-- select id, gender from public.profiles where gender = 'Non-binary';

-- ---------- 1. SKILL PROFICIENCY: Pro -> Good ----------
-- Constraint must widen BEFORE the data migrates — the old check (Basic/Pro/Expert)
-- would reject 'Good' if the UPDATE ran first (this bit us on the first run).
alter table public.user_skills drop constraint if exists user_skills_proficiency_check;
alter table public.user_skills add constraint user_skills_proficiency_check
  check (proficiency in ('Basic','Pro','Good','Expert'));
update public.user_skills set proficiency = 'Good' where proficiency = 'Pro';
alter table public.user_skills drop constraint if exists user_skills_proficiency_check;
alter table public.user_skills add constraint user_skills_proficiency_check
  check (proficiency in ('Basic','Good','Expert'));

-- ---------- 2. INTERESTS: closed set of 9, drop anything else ----------
-- profiles.interests, projects.interests, groups.interests_wanted are text[]
-- with no prior enum enforcement — three different app-level lists had drifted.
-- Canonical 9: Sustainability, EdTech, Web Dev, Healthcare, Data Science,
-- Social Impact, Robotics, AI & ML, Design.
update public.profiles
   set interests = coalesce((select array_agg(i) from unnest(interests) as i
     where i in ('Sustainability','EdTech','Web Dev','Healthcare','Data Science','Social Impact','Robotics','AI & ML','Design')), '{}');
update public.projects
   set interests = coalesce((select array_agg(i) from unnest(interests) as i
     where i in ('Sustainability','EdTech','Web Dev','Healthcare','Data Science','Social Impact','Robotics','AI & ML','Design')), '{}');
update public.groups
   set interests_wanted = coalesce((select array_agg(i) from unnest(interests_wanted) as i
     where i in ('Sustainability','EdTech','Web Dev','Healthcare','Data Science','Social Impact','Robotics','AI & ML','Design')), '{}');

alter table public.profiles drop constraint if exists profiles_interests_check;
alter table public.profiles add constraint profiles_interests_check
  check (interests <@ array['Sustainability','EdTech','Web Dev','Healthcare','Data Science','Social Impact','Robotics','AI & ML','Design']::text[]);
alter table public.projects drop constraint if exists projects_interests_check;
alter table public.projects add constraint projects_interests_check
  check (interests <@ array['Sustainability','EdTech','Web Dev','Healthcare','Data Science','Social Impact','Robotics','AI & ML','Design']::text[]);
alter table public.groups drop constraint if exists groups_interests_wanted_check;
alter table public.groups add constraint groups_interests_wanted_check
  check (interests_wanted <@ array['Sustainability','EdTech','Web Dev','Healthcare','Data Science','Social Impact','Robotics','AI & ML','Design']::text[]);

-- ---------- 3. GENDER: drop to 3 options ----------
-- Non-binary removed per spec; existing rows folded into 'Prefer not to say'
-- (least-assumption default — flag to product owner if a different mapping is wanted).
update public.profiles set gender = 'Prefer not to say' where gender = 'Non-binary';
alter table public.profiles drop constraint if exists profiles_gender_check;
alter table public.profiles add constraint profiles_gender_check
  check (gender is null or gender in ('Woman','Man','Prefer not to say'));

-- ---------- 4. MULTI-UNIVERSITY: email-domain allowlist ----------
-- Groovp is multi-university, not SUTD-exclusive. Signup validates the
-- email domain against this table and sets profiles.university from it
-- (see app/auth/actions.js signUpFull). Add more schools as needed.
create table if not exists public.university_domains (
  domain     text primary key,   -- e.g. 'sutd.edu.sg'
  university text not null       -- e.g. 'SUTD'
);
insert into public.university_domains (domain, university) values
  ('sutd.edu.sg', 'SUTD')
on conflict (domain) do nothing;

alter table public.university_domains enable row level security;
drop policy if exists "unidomains_read" on public.university_domains;
-- must be readable pre-auth (signup validates domain before the account exists)
create policy "unidomains_read" on public.university_domains for select to anon, authenticated using (true);

-- ---------- 5. REAPPLY COOLDOWN: 3 days after a Decline ----------
alter table public.join_requests add column if not exists declined_at timestamptz;

-- ---------- 6. EDIT GROUP: leader can remove members + transfer leadership ----------
-- members_write only lets a member manage their OWN row (leave group). A leader
-- needs to remove OTHER members too — mirrors the existing members_leader_insert policy.
drop policy if exists "members_leader_delete" on public.group_members;
create policy "members_leader_delete" on public.group_members for delete to authenticated
  using (exists (select 1 from public.groups g where g.id = group_members.group_id and g.leader_id = auth.uid()));

-- ---------- 6b. RESOURCE FILE UPLOAD: storage bucket + column ----------
-- Create Project Step 2 has both a resource LINK (already existed, projects.project_link)
-- and a genuine file upload (confirmed in spec: JPEG/PNG/PDF/MP4, 50MB max) — that upload
-- never had a bucket to land in. `public: true` matches this app's existing loose-RLS
-- style for other static assets (blobs, avatars) — simplest way to serve uploaded files
-- back out without a signed-URL dance for what's meant to be visible to anyone who can
-- already see the project.
alter table public.projects add column if not exists resource_files text[] default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-resources', 'project-resources', true, 52428800, array['image/jpeg','image/png','application/pdf','video/mp4'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "presources_insert" on storage.objects;
create policy "presources_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'project-resources');
drop policy if exists "presources_delete" on storage.objects;
create policy "presources_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'project-resources' and owner = auth.uid());

-- ---------- 6c. GROUP/PROJECT PHOTO: rounded-square avatar upload ----------
-- Same pattern as the resource-files bucket, separate bucket since this is
-- images-only and much smaller (5MB, matches typical avatar-upload limits).
alter table public.groups   add column if not exists photo_url text;
alter table public.projects add column if not exists photo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_insert" on storage.objects;
create policy "avatars_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');
drop policy if exists "avatars_delete" on storage.objects;
create policy "avatars_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and owner = auth.uid());

-- ---------- 7. RECENTLY VIEWED: project view log ----------
-- Home's "Recently viewed" header existed already but was wired to the SAME project
-- list as Popular/Latest below it — not an actual view history. This is the real thing.
create table if not exists public.project_views (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  viewed_at  timestamptz default now(),
  primary key (user_id, project_id)
);
alter table public.project_views enable row level security;
drop policy if exists "pviews_rw" on public.project_views;
create policy "pviews_rw" on public.project_views for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- groups_write's single `for all` policy used the same `with check (auth.uid() =
-- leader_id)` for insert AND update — but `with check` evaluates against the NEW row,
-- which would permanently block a leader from ever transferring leadership (the new
-- row's leader_id would no longer be their own auth.uid(), so the check would fail).
-- Split into per-operation policies: insert/delete keep the strict check; update only
-- gates on who the CURRENT leader is (via `using`, evaluated against the OLD row) and
-- allows the new row to set any leader_id — that's what a transfer actually is.
drop policy if exists "groups_write" on public.groups;
create policy "groups_insert" on public.groups for insert to authenticated with check (auth.uid() = leader_id);
create policy "groups_update" on public.groups for update to authenticated using (auth.uid() = leader_id) with check (true);
create policy "groups_delete" on public.groups for delete to authenticated using (auth.uid() = leader_id);
