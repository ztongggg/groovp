-- v14: Web Experiment (Personalised Work Style condition) — thin,
-- removable instrumentation, backend half. Two plain tables to time the
-- 4 tasks, plus 2 SECURITY DEFINER RPCs that let a signed-in participant
-- trigger two pieces of "stagecraft" that RLS would otherwise correctly
-- block (accepting your own pending request — normally leader-only; and
-- a group's leader inserting *other* people's pending join_requests —
-- normally only 'invited' rows are allowed for that). Both RPCs are
-- narrowly scoped (see comments) so the worst case if someone calls them
-- directly via the Supabase client, outside the app's own gating, is
-- "joined a group a few seconds early" or "4 harmless fake requests on
-- your own empty group" — not a real privilege escalation. School-project
-- risk bar, not a template for gating anything sensitive.

-- ---------- tables ----------
create table if not exists public.experiment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  condition text not null default 'personalised',
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table if not exists public.experiment_task_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.experiment_sessions(id) on delete cascade,
  task_number int not null,
  started_at timestamptz,
  ended_at timestamptz,
  unique (session_id, task_number)
);

alter table public.experiment_sessions enable row level security;
alter table public.experiment_task_events enable row level security;

-- Timing metadata only — no financial/account data, and the session starts
-- BEFORE the participant has an account, so writes can't be gated on
-- auth.uid() ownership the way the rest of this app's RLS is. Permissive by
-- design (same precedent as this app's existing loosely-scoped tables).
drop policy if exists "experiment_sessions_all" on public.experiment_sessions;
create policy "experiment_sessions_all" on public.experiment_sessions for all to anon, authenticated using (true) with check (true);
drop policy if exists "experiment_task_events_all" on public.experiment_task_events;
create policy "experiment_task_events_all" on public.experiment_task_events for all to anon, authenticated using (true) with check (true);

-- ---------- RPC: auto-accept your own pending request ----------
-- Task 2's "stagecraft" — a participant's real pending join_request on a
-- seeded-leader group gets accepted for real, but there's no second human
-- to click Accept. Only ever touches a request whose user_id is the caller
-- themselves, only once it's been pending 15s+, and only while it's still
-- pending — so it can only ever move your OWN request forward a little
-- early, never anyone else's.
create or replace function public.experiment_auto_accept(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group uuid;
  v_user uuid;
  v_project uuid;
  v_created timestamptz;
begin
  select group_id, user_id, created_at into v_group, v_user, v_created
  from public.join_requests
  where id = p_request_id and status = 'pending';

  if v_user is null or v_user <> auth.uid() then
    return;
  end if;
  if v_created > now() - interval '15 seconds' then
    return;
  end if;

  update public.join_requests set status = 'accepted' where id = p_request_id;
  insert into public.group_members (group_id, user_id, role) values (v_group, v_user, 'member') on conflict do nothing;

  select project_id into v_project from public.groups where id = v_group;
  if v_project is not null then
    insert into public.project_members (project_id, user_id) values (v_project, v_user) on conflict do nothing;
  end if;

  insert into public.notifications (user_id, type, related_id, body)
  values (v_user, 'join_accepted', v_group, 'You''re in! Your request was accepted.');
end;
$$;
grant execute on function public.experiment_auto_accept(uuid) to authenticated;

-- ---------- RPC: seed 4 applicants onto a brand-new empty group ----------
-- Task 3/4's "stagecraft" — reversed direction: the participant is now the
-- leader waiting for applicants. Only fires for the group's own leader, and
-- only when that group genuinely has zero requests yet (so it's a one-shot,
-- not something that can pile up duplicates on repeat page loads). Draws
-- applicants only from the seeded demo personas (id prefix from
-- seed_showcase.sql), never from real users.
create or replace function public.experiment_seed_applicants(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_leader uuid;
  v_existing int;
begin
  select leader_id into v_leader from public.groups where id = p_group_id;
  if v_leader is null or v_leader <> auth.uid() then
    return;
  end if;

  select count(*) into v_existing from public.join_requests where group_id = p_group_id;
  if v_existing > 0 then
    return;
  end if;

  with picked as (
    select id, row_number() over () as rn
    from (select id from public.profiles where id::text like 'a0000000%' order by random() limit 4) x
  ),
  notes as (
    select * from unnest(array[
      'Would love to be part of this — I''ve got some relevant experience and I''m free most evenings.',
      null,
      'This looks like a great fit for what I''m into right now, happy to jump in wherever''s needed.',
      null
    ]) with ordinality as n(note, rn)
  )
  insert into public.join_requests (group_id, user_id, status, comment)
  select p_group_id, picked.id, 'pending', notes.note
  from picked join notes using (rn);

  insert into public.notifications (user_id, type, related_id, body)
  values (v_leader, 'new_join_requests', p_group_id, '4 new people want to join your group');
end;
$$;
grant execute on function public.experiment_seed_applicants(uuid) to authenticated;
