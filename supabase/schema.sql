-- Groovp database schema
-- Run this in the Supabase dashboard → SQL Editor → New query → Run.
-- Safe to re-run (drops policies/triggers before recreating).

-- ============================================================
-- PROFILES  (1:1 with auth.users)
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text,
  username      text unique,
  email         text,
  university    text default 'SUTD',
  major         text,
  year          text,                       -- e.g. 'Y3'
  avatar_url    text,
  bio           text,
  -- onboarding personality answers
  personality      text,                    -- Introvert / Extrovert
  prefer_working   text,                    -- Online / Face-to-face
  best_work_time   text,                    -- At night / In the morning
  location         text,                    -- Central / East / ...
  skills        text[] default '{}',
  interests     text[] default '{}',
  linkedin_url  text,
  github_url    text,
  portfolio_url text,
  created_at    timestamptz default now()
);

-- ============================================================
-- PROJECTS
-- ============================================================
create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references public.profiles (id) on delete cascade,
  name           text not null,
  description    text,
  type           text default 'academic',   -- 'academic' | 'personal'
  image_color    text default 'teal',
  skills_needed  text[] default '{}',
  interests      text[] default '{}',
  min_size       int default 2,
  max_size       int default 5,
  timeline_start date,
  timeline_end   date,
  privacy        text default 'public',      -- public | restricted | invite-only
  joining_method text default 'approval',    -- approval | auto
  project_link   text,
  allow_multiple_groups boolean default true,
  created_at     timestamptz default now()
);

-- ============================================================
-- GROUPS  (a project can have multiple groups when academic)
-- ============================================================
create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  name        text not null,
  leader_id   uuid not null references public.profiles (id) on delete cascade,
  recruiting  boolean default true,
  looking_for int default 0,
  recruit_note text,
  created_at  timestamptz default now()
);

create table if not exists public.group_members (
  group_id  uuid not null references public.groups (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  role      text default 'member',           -- leader | member
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

-- ============================================================
-- JOIN REQUESTS
-- ============================================================
create table if not exists public.join_requests (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  comment    text,
  status     text default 'pending',          -- pending | accepted | declined
  created_at timestamptz default now(),
  unique (group_id, user_id)
);

-- ============================================================
-- RATINGS
-- ============================================================
create table if not exists public.ratings (
  id         uuid primary key default gen_random_uuid(),
  rater_id   uuid not null references public.profiles (id) on delete cascade,
  ratee_id   uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  stars      int not null check (stars between 1 and 5),
  comment    text,
  created_at timestamptz default now()
);

-- ============================================================
-- MESSAGES  (group + private chats; private uses group_id null + pair key)
-- ============================================================
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid references public.groups (id) on delete cascade,
  sender_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Auto-create a profile row when a new auth user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, username)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.projects      enable row level security;
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;
alter table public.join_requests enable row level security;
alter table public.ratings       enable row level security;
alter table public.messages      enable row level security;

-- profiles: everyone signed in can read; you can write only your own row
drop policy if exists "profiles_read"   on public.profiles;
drop policy if exists "profiles_insert" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_read"   on public.profiles for select to authenticated using (true);
create policy "profiles_insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update to authenticated using (auth.uid() = id);

-- projects: read all; write your own
drop policy if exists "projects_read"   on public.projects;
drop policy if exists "projects_write"  on public.projects;
create policy "projects_read"  on public.projects for select to authenticated using (true);
create policy "projects_write" on public.projects for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- groups / members: read all; write your own leadership/membership
drop policy if exists "groups_read"  on public.groups;
drop policy if exists "groups_write" on public.groups;
create policy "groups_read"  on public.groups for select to authenticated using (true);
create policy "groups_write" on public.groups for all to authenticated using (auth.uid() = leader_id) with check (auth.uid() = leader_id);

drop policy if exists "members_read"  on public.group_members;
drop policy if exists "members_write" on public.group_members;
create policy "members_read"  on public.group_members for select to authenticated using (true);
create policy "members_write" on public.group_members for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- join_requests: read/write your own request
drop policy if exists "requests_read"  on public.join_requests;
drop policy if exists "requests_write" on public.join_requests;
create policy "requests_read"  on public.join_requests for select to authenticated using (true);
create policy "requests_write" on public.join_requests for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ratings: read all; write your own
drop policy if exists "ratings_read"  on public.ratings;
drop policy if exists "ratings_write" on public.ratings;
create policy "ratings_read"  on public.ratings for select to authenticated using (true);
create policy "ratings_write" on public.ratings for insert to authenticated with check (auth.uid() = rater_id);

-- messages: read all (demo); write your own
drop policy if exists "messages_read"  on public.messages;
drop policy if exists "messages_write" on public.messages;
create policy "messages_read"  on public.messages for select to authenticated using (true);
create policy "messages_write" on public.messages for insert to authenticated with check (auth.uid() = sender_id);
