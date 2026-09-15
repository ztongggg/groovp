-- Every Web Experiment session — who picked A/B, their name, and how far
-- they got — regardless of whether the session ever linked to
-- a real account. Driven from experiment_sessions (not auth.users/
-- profiles), which is the fix for the "I saw my results but I'm not in
-- the SQL" problem: linking only happens once, right after signup
-- (completeExperimentTask1() in lib/experiment.js) — if that write ever
-- fails/races, the session keeps recording real task timestamps off its
-- cookie with no account attached, so a query that starts FROM accounts
-- can never find it. Starting from sessions instead means nothing is
-- invisible (though a still-unlinked row obviously has no signup info to
-- show — see the Name column's fallback text for that case).
--
-- Status logic per task matches the app's own admin dashboard exactly
-- (ABANDON_AFTER_MS in lib/experiment.js — open 20+ min with no end =
-- Abandoned, not "in progress" forever).

select
  es.id as "Session ID",
  case es.condition when 'personalised' then 'A' when 'neutral' then 'B' else es.condition end as "Web Experiment A/B",
  es.created_at as "Session Started",
  coalesce(p.full_name, case when es.user_id is not null then '(account deleted/no profile)' else '(never completed signup)' end) as "Name",
  (es.completed_at is not null) as "Fully Completed",

  case
    when t1.started_at is null then 'Not Started'
    when t1.ended_at is not null then 'Done'
    when now() - t1.started_at > interval '20 minutes' then 'Abandoned'
    else 'In Progress'
  end as "Task 1 Status",
  to_char(t1.ended_at - t1.started_at, 'MI:SS') as "Task 1 Time",

  case
    when t2.started_at is null then 'Not Started'
    when t2.ended_at is not null then 'Done'
    when now() - t2.started_at > interval '20 minutes' then 'Abandoned'
    else 'In Progress'
  end as "Task 2 Status",
  to_char(t2.ended_at - t2.started_at, 'MI:SS') as "Task 2 Time",

  case
    when t3.started_at is null then 'Not Started'
    when t3.ended_at is not null then 'Done'
    when now() - t3.started_at > interval '20 minutes' then 'Abandoned'
    else 'In Progress'
  end as "Task 3 Status",
  to_char(t3.ended_at - t3.started_at, 'MI:SS') as "Task 3 Time",

  case
    when t4.started_at is null then 'Not Started'
    when t4.ended_at is not null then 'Done'
    when now() - t4.started_at > interval '20 minutes' then 'Abandoned'
    else 'In Progress'
  end as "Task 4 Status",
  to_char(t4.ended_at - t4.started_at, 'MI:SS') as "Task 4 Time",

  to_char(es.completed_at - es.created_at, 'MI:SS') as "Total Time"
from public.experiment_sessions es
left join public.profiles p on p.id = es.user_id
left join public.experiment_task_events t1 on t1.session_id = es.id and t1.task_number = 1
left join public.experiment_task_events t2 on t2.session_id = es.id and t2.task_number = 2
left join public.experiment_task_events t3 on t3.session_id = es.id and t3.task_number = 3
left join public.experiment_task_events t4 on t4.session_id = es.id and t4.task_number = 4
where t1.started_at is not null or t2.started_at is not null or t3.started_at is not null or t4.started_at is not null
order by es.created_at desc;
