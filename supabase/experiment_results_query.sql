-- Web Experiment results — one row per participant who reached at least
-- Task 1 (i.e. actually created an account), everything they entered at
-- signup plus how long each of the 4 tasks took them.
--
-- Run in the Supabase SQL Editor: https://supabase.com/dashboard/project/cvlvrousapvmamkcexpl/sql/new
-- Condition A = Personalised (real matching), B = Neutral (personality/
-- work-style stripped) — see HANDOFF.md's Web Experiment sections.

select
  case es.condition when 'personalised' then 'A' when 'neutral' then 'B' else es.condition end as "Web Experiment A/B",
  p.full_name                        as "Name",
  p.username                         as "Username",
  u.email                            as "Email",
  p.university                       as "School",
  p.major                            as "Course",
  p.year                             as "Year",
  p.gender                           as "Gender",
  p.personality                      as "Personality",
  p.prefer_working                   as "Prefer Working",
  p.best_work_time                   as "Best Work Time",
  p.location                         as "Location",
  array_to_string(p.skills, ', ')    as "Skills",
  array_to_string(p.interests, ', ') as "Interests",
  p.linkedin_url                     as "LinkedIn",
  p.github_url                       as "GitHub",
  p.portfolio_url                    as "Portfolio",
  to_char(t1.ended_at - t1.started_at, 'MI:SS') as "Task 1 Time",
  to_char(t2.ended_at - t2.started_at, 'MI:SS') as "Task 2 Time",
  to_char(t3.ended_at - t3.started_at, 'MI:SS') as "Task 3 Time",
  to_char(t4.ended_at - t4.started_at, 'MI:SS') as "Task 4 Time",
  to_char(es.completed_at - es.created_at, 'MI:SS') as "Total Time",
  es.created_at                      as "Session Started"
from public.experiment_sessions es
join public.profiles p on p.id = es.user_id
left join auth.users u on u.id = es.user_id
left join public.experiment_task_events t1 on t1.session_id = es.id and t1.task_number = 1
left join public.experiment_task_events t2 on t2.session_id = es.id and t2.task_number = 2
left join public.experiment_task_events t3 on t3.session_id = es.id and t3.task_number = 3
left join public.experiment_task_events t4 on t4.session_id = es.id and t4.task_number = 4
where es.user_id is not null
order by es.created_at desc;
