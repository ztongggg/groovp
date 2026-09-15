-- One row per task that actually has a recorded time — skips tasks nobody
-- ever reached (started_at null). Shows the raw start/end timestamps too,
-- not just the computed duration, so an in-progress task (started, not yet
-- ended) still shows up with its start time and a blank "Time Taken"
-- instead of being hidden.

select
  case es.condition when 'personalised' then 'A' when 'neutral' then 'B' else es.condition end as "Web Experiment A/B",
  coalesce(p.full_name, '(unlinked session)') as "Name",
  p.username as "Username",
  te.task_number as "Task",
  te.started_at as "Started At",
  te.ended_at as "Ended At",
  case when te.ended_at is not null then to_char(te.ended_at - te.started_at, 'MI:SS') else null end as "Time Taken"
from public.experiment_task_events te
join public.experiment_sessions es on es.id = te.session_id
left join public.profiles p on p.id = es.user_id
where te.started_at is not null
order by es.created_at desc, te.task_number asc;
