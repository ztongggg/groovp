-- ============================================================
-- Groovp schema v3 (additive) — moderation review + invite-by-username
-- Safe to run more than once. Paste into Supabase SQL Editor.
-- ============================================================

-- ---------- ADMIN FLAG (for moderation review tooling) ----------
alter table public.profiles add column if not exists is_admin boolean default false;

-- Seed the first admin. flowtest1 = username 'flow_leader'.
-- Change the username / add rows to grant others.
update public.profiles set is_admin = true where username = 'flow_leader';

-- ---------- REPORTS: let admins review, not just submit ----------
-- (report_read / report_write from v2 stay — a user still reads/creates their own.)
drop policy if exists "report_read_admin" on public.reports;
create policy "report_read_admin" on public.reports for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "report_update_admin" on public.reports;
create policy "report_update_admin" on public.reports for update to authenticated
  using      (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---------- INVITE BY USERNAME ----------
-- A leader may create an 'invited' join_request for someone else's user_id.
-- (requests_write only allows rows where user_id = self; this adds the leader path.)
-- The invitee accepts/declines via requests_write (their own row) and adds
-- themselves through the existing members_write policy.
drop policy if exists "requests_leader_invite" on public.join_requests;
create policy "requests_leader_invite" on public.join_requests for insert to authenticated
  with check (
    status = 'invited'
    and exists (select 1 from public.groups g where g.id = join_requests.group_id and g.leader_id = auth.uid())
  );
