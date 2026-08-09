-- Finds Web Experiment sessions that finished (or are running) but never
-- got linked to an account — experiment_sessions.user_id is only ever set
-- by completeExperimentTask1() right after signup succeeds (lib/experiment.js).
-- If that one write fails/races, everything else keeps working off the
-- session cookie alone (task timing, the results page itself) with no
-- account link, so these never show up in a query that starts from
-- auth.users/profiles. This is why someone can say "I saw my results" and
-- not appear in the other queries.

-- ---------- A) the orphaned sessions themselves, raw ----------
select
  es.id as "Session ID",
  case es.condition when 'personalised' then 'A' when 'neutral' then 'B' else es.condition end as "Web Experiment A/B",
  es.created_at as "Session Started",
  (es.completed_at is not null) as "Completed",
  to_char(t1.ended_at - t1.started_at, 'MI:SS') as "Task 1 Time",
  to_char(t2.ended_at - t2.started_at, 'MI:SS') as "Task 2 Time",
  to_char(t3.ended_at - t3.started_at, 'MI:SS') as "Task 3 Time",
  to_char(t4.ended_at - t4.started_at, 'MI:SS') as "Task 4 Time",
  to_char(es.completed_at - es.created_at, 'MI:SS') as "Total Time"
from public.experiment_sessions es
left join public.experiment_task_events t1 on t1.session_id = es.id and t1.task_number = 1
left join public.experiment_task_events t2 on t2.session_id = es.id and t2.task_number = 2
left join public.experiment_task_events t3 on t3.session_id = es.id and t3.task_number = 3
left join public.experiment_task_events t4 on t4.session_id = es.id and t4.task_number = 4
where es.user_id is null
order by es.created_at desc;

-- ---------- B) best-effort guess at WHO each orphaned session belongs to ----------
-- Task 1 starts the instant they land on signup and ends the instant their
-- account is created, so the real account should have been created within
-- a few minutes of the session's created_at. Heuristic, not authoritative —
-- flags a "Seconds Between" column so you can judge confidence; if two
-- people signed up in the same window this can guess wrong.
select
  es.id as "Session ID",
  case es.condition when 'personalised' then 'A' when 'neutral' then 'B' else es.condition end as "Web Experiment A/B",
  es.created_at as "Session Started",
  cand.full_name as "Likely Name",
  cand.username as "Likely Username",
  cand.email as "Likely Email",
  round(cand.seconds_apart) as "Seconds Between Session Start & Signup",
  to_char(t1.ended_at - t1.started_at, 'MI:SS') as "Task 1 Time",
  to_char(t2.ended_at - t2.started_at, 'MI:SS') as "Task 2 Time",
  to_char(t3.ended_at - t3.started_at, 'MI:SS') as "Task 3 Time",
  to_char(t4.ended_at - t4.started_at, 'MI:SS') as "Task 4 Time",
  to_char(es.completed_at - es.created_at, 'MI:SS') as "Total Time"
from public.experiment_sessions es
left join lateral (
  select p.full_name, p.username, u.email,
         extract(epoch from (u.created_at - es.created_at)) as seconds_apart
  from auth.users u
  join public.profiles p on p.id = u.id
  where u.created_at >= es.created_at
    and u.created_at <= es.created_at + interval '15 minutes'
  order by u.created_at asc
  limit 1
) cand on true
left join public.experiment_task_events t1 on t1.session_id = es.id and t1.task_number = 1
left join public.experiment_task_events t2 on t2.session_id = es.id and t2.task_number = 2
left join public.experiment_task_events t3 on t3.session_id = es.id and t3.task_number = 3
left join public.experiment_task_events t4 on t4.session_id = es.id and t4.task_number = 4
where es.user_id is null
order by es.created_at desc;
