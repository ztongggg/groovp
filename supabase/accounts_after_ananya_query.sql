-- Accounts created after "Ananya" (matched by full_name prefix — if there's
-- more than one Ananya, this takes the earliest by signup time; swap the
-- CTE for a known email/id if that's ambiguous). Full signup info per
-- account, plus Web Experiment A/B + per-task time IF they started one
-- (LEFT JOINs — non-experiment signups just show blank in those columns).
--
-- Also surfaces people who got stuck partway: each task gets a status
-- (Not Started / In Progress / Abandoned / Done), same "open 20+ min with
-- no end = Abandoned" rule the app's own admin dashboard uses
-- (ABANDON_AFTER_MS in lib/experiment.js) — not a different definition.
-- "Experiment Status" gives the one-glance summary: Completed vs Incomplete.

with ananya as (
  select u.created_at
  from auth.users u
  join public.profiles p on p.id = u.id
  where p.full_name ilike 'Ananya%'
  order by u.created_at asc
  limit 1
)
select
  u.created_at                        as "Signed Up At",
  p.full_name                         as "Name",
  p.username                          as "Username",
  u.email                             as "Email",
  p.university                        as "School",
  p.major                             as "Course",
  p.year                              as "Year",
  p.gender                            as "Gender",
  p.personality                       as "Personality",
  p.prefer_working                    as "Prefer Working",
  p.best_work_time                    as "Best Work Time",
  p.location                          as "Location",
  array_to_string(p.skills, ', ')     as "Skills",
  array_to_string(p.interests, ', ')  as "Interests",
  p.linkedin_url                      as "LinkedIn",
  p.github_url                        as "GitHub",
  p.portfolio_url                     as "Portfolio",
  case es.condition when 'personalised' then 'A' when 'neutral' then 'B' else null end as "Web Experiment A/B",
  case
    when es.id is null then null
    when es.completed_at is not null then 'Completed'
    else 'Incomplete'
  end as "Experiment Status",
  case
    when t1.started_at is null then 'Not Started'
    when t1.ended_at is not null then 'Done'
    when now() - t1.started_at > interval '20 minutes' then 'Abandoned'
    else 'In Progress'
  end as "Task 1 Status",
  to_char(t1.ended_at - t1.started_at, 'MI:SS')     as "Task 1 Time",
  case
    when t2.started_at is null then 'Not Started'
    when t2.ended_at is not null then 'Done'
    when now() - t2.started_at > interval '20 minutes' then 'Abandoned'
    else 'In Progress'
  end as "Task 2 Status",
  to_char(t2.ended_at - t2.started_at, 'MI:SS')     as "Task 2 Time",
  case
    when t3.started_at is null then 'Not Started'
    when t3.ended_at is not null then 'Done'
    when now() - t3.started_at > interval '20 minutes' then 'Abandoned'
    else 'In Progress'
  end as "Task 3 Status",
  to_char(t3.ended_at - t3.started_at, 'MI:SS')     as "Task 3 Time",
  case
    when t4.started_at is null then 'Not Started'
    when t4.ended_at is not null then 'Done'
    when now() - t4.started_at > interval '20 minutes' then 'Abandoned'
    else 'In Progress'
  end as "Task 4 Status",
  to_char(t4.ended_at - t4.started_at, 'MI:SS')     as "Task 4 Time",
  to_char(es.completed_at - es.created_at, 'MI:SS') as "Total Time"
from auth.users u
join public.profiles p on p.id = u.id
cross join ananya
left join lateral (
  select * from public.experiment_sessions
  where user_id = u.id
  order by created_at desc
  limit 1
) es on true
left join public.experiment_task_events t1 on t1.session_id = es.id and t1.task_number = 1
left join public.experiment_task_events t2 on t2.session_id = es.id and t2.task_number = 2
left join public.experiment_task_events t3 on t3.session_id = es.id and t3.task_number = 3
left join public.experiment_task_events t4 on t4.session_id = es.id and t4.task_number = 4
where u.created_at > ananya.created_at
order by u.created_at asc;
