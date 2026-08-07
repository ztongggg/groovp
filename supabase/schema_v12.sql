-- v12: shared skill catalog, so "add my own skill" additions become real
-- suggestions for every other picker instead of vanishing into one user's
-- profile array.
--
-- Anon-writable/readable on purpose: this table only ever holds skill NAME
-- STRINGS with no user linkage, and the signup flow's skill picker runs
-- before an account (and therefore a session) exists. Same risk class as
-- any public signup form field — worst case is a junk skill name, not a
-- data leak.

create table if not exists public.skill_catalog (
  name       text primary key,
  created_at timestamptz default now()
);

alter table public.skill_catalog enable row level security;

drop policy if exists "skill_catalog_read" on public.skill_catalog;
drop policy if exists "skill_catalog_insert" on public.skill_catalog;
create policy "skill_catalog_read"   on public.skill_catalog for select to anon, authenticated using (true);
create policy "skill_catalog_insert" on public.skill_catalog for insert to anon, authenticated with check (true);

-- Seed with every skill option previously hardcoded across the app's various
-- pickers (signup, Edit Profile, Create Project, Recruiting Settings, Start a
-- New Group, Filter Panel) so the shared list starts non-empty.
insert into public.skill_catalog (name) values
  ('Python'), ('React'), ('TypeScript'), ('JavaScript'), ('Node.js'), ('SQL'),
  ('Figma'), ('UI/UX'), ('Java'), ('C++'), ('TensorFlow'), ('AWS'), ('Docker'),
  ('Research'), ('Product'), ('Design'), ('Business'), ('AI/ML'), ('FastAPI'), ('PyTorch')
on conflict (name) do nothing;
