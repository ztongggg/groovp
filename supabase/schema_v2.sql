-- ============================================================
-- Groovp schema v2 — aligns the database to the backend spec.
-- ADDITIVE and safe to re-run: only adds tables/columns/policies,
-- never drops existing data. Run in Supabase → SQL Editor.
-- ============================================================

-- ---------- USER / PROFILE ----------
alter table public.profiles add column if not exists gender       text;                       -- Woman | Man | Non-binary | Prefer not to say
alter table public.profiles add column if not exists avatar_color text default 'purple';      -- mascot color (enum-ish, not a photo)
alter table public.profiles add column if not exists avatar_pose  text default 'static';
alter table public.profiles add column if not exists rating_average numeric default 0;
alter table public.profiles add column if not exists rating_count   int default 0;

-- Skills with proficiency (Basic | Pro | Expert). Replaces profiles.skills[] over time.
create table if not exists public.user_skills (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  skill_name  text not null,
  proficiency text not null default 'Basic' check (proficiency in ('Basic','Pro','Expert')),
  primary key (user_id, skill_name)
);

-- ---------- PROJECT ----------
alter table public.projects add column if not exists course_code    text;   -- Academic only
alter table public.projects add column if not exists instructor     text;   -- Academic only
alter table public.projects add column if not exists things_to_note text;
alter table public.projects add column if not exists category       text;

create table if not exists public.project_favorites (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, project_id)
);

-- ---------- GROUP (recruiting is PER-GROUP) ----------
alter table public.groups add column if not exists status             text default 'Forming' check (status in ('Forming','Active','Ended'));
alter table public.groups add column if not exists min_members        int default 2;
alter table public.groups add column if not exists max_members        int default 5;
alter table public.groups add column if not exists members_wanted     int default 0;
alter table public.groups add column if not exists skills_wanted      text[] default '{}';
alter table public.groups add column if not exists personality_wanted text[] default '{}';
alter table public.groups add column if not exists interests_wanted   text[] default '{}';
alter table public.groups add column if not exists additional_notes   text;
alter table public.groups add column if not exists joining_method     text default 'approval';  -- approval | auto
alter table public.groups add column if not exists resource_link      text;

-- ---------- JOIN REQUEST ----------
alter table public.join_requests add column if not exists note text;  -- optional message with the request

-- ---------- RATING ----------
alter table public.ratings add column if not exists group_id uuid references public.groups (id) on delete set null;

-- ---------- PAST PROJECT (profile "Project" tab) ----------
create table if not exists public.past_projects (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  role       text,
  write_up   text,
  photos     text[] default '{}',
  created_at timestamptz default now()
);

-- ---------- CONVERSATIONS + MESSAGES (group + private in one inbox) ----------
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('group','private')),
  group_id   uuid references public.groups (id) on delete cascade,   -- set for group convos
  created_at timestamptz default now()
);
create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  last_read_at    timestamptz,
  primary key (conversation_id, user_id)
);
alter table public.messages add column if not exists conversation_id uuid references public.conversations (id) on delete cascade;

-- ---------- NOTIFICATIONS ----------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       text not null,          -- join_accepted | rate_reminder | new_join_requests | new_message
  related_id uuid,
  body       text,
  read       boolean default false,
  created_at timestamptz default now()
);

-- ---------- REPORT / BLOCK ----------
create table if not exists public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid not null references public.profiles (id) on delete cascade,
  reason           text not null,     -- Fake profile | Inappropriate | Spam | Harassment | Other
  details          text,
  status           text default 'open',
  created_at       timestamptz default now()
);
create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

-- ============================================================
-- Row Level Security for the new tables
-- ============================================================
alter table public.user_skills               enable row level security;
alter table public.project_favorites         enable row level security;
alter table public.past_projects             enable row level security;
alter table public.conversations             enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.notifications             enable row level security;
alter table public.reports                   enable row level security;
alter table public.blocks                    enable row level security;

-- user_skills: everyone signed in reads; you write only your own
drop policy if exists "uskills_read" on public.user_skills;
drop policy if exists "uskills_write" on public.user_skills;
create policy "uskills_read"  on public.user_skills for select to authenticated using (true);
create policy "uskills_write" on public.user_skills for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- favorites: your own
drop policy if exists "fav_read" on public.project_favorites;
drop policy if exists "fav_write" on public.project_favorites;
create policy "fav_read"  on public.project_favorites for select to authenticated using (auth.uid() = user_id);
create policy "fav_write" on public.project_favorites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- past_projects: read all; write own
drop policy if exists "past_read" on public.past_projects;
drop policy if exists "past_write" on public.past_projects;
create policy "past_read"  on public.past_projects for select to authenticated using (true);
create policy "past_write" on public.past_projects for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- conversations / participants: read all (demo); insert authed; participants write own row
drop policy if exists "conv_read" on public.conversations;
drop policy if exists "conv_write" on public.conversations;
create policy "conv_read"  on public.conversations for select to authenticated using (true);
create policy "conv_write" on public.conversations for insert to authenticated with check (true);

drop policy if exists "cpart_read" on public.conversation_participants;
drop policy if exists "cpart_write" on public.conversation_participants;
create policy "cpart_read"  on public.conversation_participants for select to authenticated using (true);
create policy "cpart_write" on public.conversation_participants for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- notifications: read/update your own; anyone signed in may create (app inserts on events)
drop policy if exists "notif_read" on public.notifications;
drop policy if exists "notif_insert" on public.notifications;
drop policy if exists "notif_update" on public.notifications;
create policy "notif_read"   on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "notif_insert" on public.notifications for insert to authenticated with check (true);
create policy "notif_update" on public.notifications for update to authenticated using (auth.uid() = user_id);

-- reports: create + read your own submissions
drop policy if exists "report_read" on public.reports;
drop policy if exists "report_write" on public.reports;
create policy "report_read"  on public.reports for select to authenticated using (auth.uid() = reporter_id);
create policy "report_write" on public.reports for insert to authenticated with check (auth.uid() = reporter_id);

-- blocks: manage your own
drop policy if exists "block_read" on public.blocks;
drop policy if exists "block_write" on public.blocks;
create policy "block_read"  on public.blocks for select to authenticated using (auth.uid() = blocker_id);
create policy "block_write" on public.blocks for all to authenticated using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
