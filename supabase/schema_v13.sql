-- v13: close the privacy-tier enforcement gap found in a design/security
-- audit — "Restricted"/"Invite-only" have been pure UI labels since v1.
-- `projects_read` was `using (true)` for every authenticated user, and
-- nothing downstream (Discover/Home queries, requestToJoin) checked
-- `privacy` either. This makes it real:
--   - public       -> everyone (unchanged)
--   - restricted   -> owner, existing members, and anyone whose profile
--                     university matches the project owner's university
--   - invite-only  -> owner and existing members only, via direct SELECT.
--                     Join-by-code deliberately bypasses this (see the RPC
--                     below) — the code itself is the "share the link"
--                     grant the Figma spec describes, not membership.

drop policy if exists "projects_read" on public.projects;
create policy "projects_read" on public.projects for select to authenticated using (
  privacy = 'public'
  or owner_id = auth.uid()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = projects.id and pm.user_id = auth.uid()
  )
  or (
    privacy = 'restricted'
    and exists (
      select 1 from public.profiles me
      join public.profiles owner on owner.id = projects.owner_id
      where me.id = auth.uid()
        and me.university is not null
        and me.university = owner.university
    )
  )
);

-- Join-by-code needs to resolve a code to a project even when the caller
-- can't otherwise SELECT that row (an invite-only project's whole point).
-- SECURITY DEFINER, and deliberately returns only id/name — no privacy-
-- sensitive fields leak through a code guess.
create or replace function public.resolve_join_code(p_code text)
returns table(id uuid, name text)
language sql
security definer
set search_path = public
as $$
  select id, name from public.projects where join_code = p_code;
$$;
grant execute on function public.resolve_join_code(text) to authenticated;

-- Decline reason (optional) — surfaced to the applicant instead of a bare
-- "declined" with a 3-day blind reapply wait.
alter table public.join_requests add column if not exists decline_reason text;
