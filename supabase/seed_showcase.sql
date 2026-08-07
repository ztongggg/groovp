-- ============================================================
-- Groovp — full showcase reseed for a school-project demo.
-- ⚠️ DESTRUCTIVE: wipes every account and every piece of app data,
-- then recreates 12 fully-populated profiles + 8 projects across
-- SUTD/NUS/NTU/unmatched-domain students, with real skills, interests,
-- personality answers, past projects, ratings, join requests, and
-- saved projects. Run in Supabase SQL Editor (service role, bypasses RLS).
--
-- Login for ANY of the 12 accounts: password test1234, emails below.
--
-- One thing I can't verify from here: the exact `auth.users`/
-- `auth.identities` column set for THIS Supabase project's current
-- schema version. The insert below uses the standard, currently-working
-- pattern (Postgres 15/GoTrue as of 2026) — if it errors on a specific
-- column, tell me the error and I'll adjust; nothing else in the script
-- depends on guessing right except this one section.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 0) WIPE — children first, respecting FKs, then the accounts themselves.
-- ------------------------------------------------------------
delete from public.messages;
delete from public.conversation_participants;
delete from public.conversations;
delete from public.notifications;
delete from public.reports;
delete from public.blocks;
delete from public.ratings;
delete from public.join_requests;
delete from public.group_members;
delete from public.past_projects;
delete from public.project_favorites;
delete from public.project_views;
delete from public.project_members;
delete from public.user_skills;
delete from public.groups;
delete from public.projects;
delete from public.profiles;
delete from auth.identities;
delete from auth.users;

-- ------------------------------------------------------------
-- 1) University domains — extend beyond SUTD so the multi-university
--    privacy tier (Restricted = same-school) has more than one school
--    to actually demonstrate against.
-- ------------------------------------------------------------
insert into public.university_domains (domain, university) values
  ('sutd.edu.sg', 'SUTD'),
  ('u.nus.edu',   'NUS'),
  ('nus.edu.sg',  'NUS'),
  ('e.ntu.edu.sg','NTU'),
  ('ntu.edu.sg',  'NTU')
on conflict (domain) do nothing;

-- ------------------------------------------------------------
-- 2) 12 auth accounts. Same password for all: test1234.
--    Grace Lim and Ben Foster use non-school emails on purpose — they
--    show the "unmatched domain = no Restricted access" edge case the
--    privacy-tier fix (schema_v13.sql) is actually meant to demonstrate.
-- ------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000001','authenticated','authenticated','priya.sharma@sutd.edu.sg',      crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Sharma","username":"priya_sharma"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000002','authenticated','authenticated','marcus.tan@sutd.edu.sg',        crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marcus Tan","username":"marcus_tan"}',       now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000003','authenticated','authenticated','aisyah.rahman@u.nus.edu',       crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aisyah Rahman","username":"aisyah_rahman"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000004','authenticated','authenticated','weijian.lim@e.ntu.edu.sg',      crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Wei Jian Lim","username":"weijian_lim"}',    now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000005','authenticated','authenticated','devi.nair@sutd.edu.sg',         crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Devi Nair","username":"devi_nair"}',         now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000006','authenticated','authenticated','ryan.koh@u.nus.edu',            crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ryan Koh","username":"ryan_koh"}',           now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000007','authenticated','authenticated','farah.ismail@e.ntu.edu.sg',     crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Farah Ismail","username":"farah_ismail"}',   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000008','authenticated','authenticated','junhao.ong@sutd.edu.sg',        crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jun Hao Ong","username":"junhao_ong"}',      now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000009','authenticated','authenticated','grace.lim.designs@gmail.com',   crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Grace Lim","username":"grace_lim"}',         now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000010','authenticated','authenticated','haziq.rahman@u.nus.edu',        crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Haziq Rahman","username":"haziq_rahman"}',   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000011','authenticated','authenticated','chloe.wong@e.ntu.edu.sg',       crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Chloe Wong","username":"chloe_wong"}',       now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000012','authenticated','authenticated','ben.foster.exchange@outlook.com',crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ben Foster","username":"ben_foster"}',       now(), now(), '', '', '', '');

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email),
       'email', now(), now(), now()
from auth.users u
where u.id::text like 'a0000000-%';

-- ------------------------------------------------------------
-- 3) Fill in the rest of each profile (the handle_new_user trigger
--    already created a bare row per account above with id/email/
--    full_name/username from raw_user_meta_data).
-- ------------------------------------------------------------
update public.profiles set
  university = 'SUTD', major = 'Computer Science', year = 'Y3', gender = 'Woman',
  personality = 'Extrovert', prefer_working = 'Face-to-face', best_work_time = 'In the day time', location = 'Central',
  skills = array['Python','React','SQL'], interests = array['AI & ML','Data Science','Web Dev'],
  avatar_url = 'https://randomuser.me/api/portraits/women/68.jpg',
  bio = 'CS junior obsessed with LLMs and bad puns. Always down for a 2am debugging sesh with kopi in hand.'
where id = 'a0000000-0000-0000-0000-000000000001';

update public.profiles set
  university = 'SUTD', major = 'Design and Artificial Intelligence', year = 'Y4', gender = 'Man',
  personality = 'Introvert', prefer_working = 'Online', best_work_time = 'At night', location = 'East',
  skills = array['Figma','UI/UX','JavaScript'], interests = array['Design','EdTech','Sustainability'],
  avatar_url = 'https://randomuser.me/api/portraits/men/32.jpg',
  bio = 'Design nerd, night owl, will redesign your app''s onboarding whether you ask or not.'
where id = 'a0000000-0000-0000-0000-000000000002';

update public.profiles set
  university = 'NUS', major = 'Computer Science', year = 'Y2', gender = 'Woman',
  personality = 'Extrovert', prefer_working = 'Face-to-face', best_work_time = 'In the day time', location = 'West',
  skills = array['Java','SQL','Python'], interests = array['Healthcare','Data Science','Social Impact'],
  avatar_url = 'https://randomuser.me/api/portraits/women/21.jpg',
  bio = 'Trying to build things that actually help people, one buggy prototype at a time.'
where id = 'a0000000-0000-0000-0000-000000000003';

update public.profiles set
  university = 'NTU', major = 'Computer Engineering', year = 'Y3', gender = 'Man',
  personality = 'Introvert', prefer_working = 'Online', best_work_time = 'At night', location = 'North',
  skills = array['C++','TensorFlow','Docker'], interests = array['Robotics','AI & ML','EdTech'],
  avatar_url = 'https://randomuser.me/api/portraits/men/45.jpg',
  bio = 'If it has a motor and a microcontroller I probably want to automate it.'
where id = 'a0000000-0000-0000-0000-000000000004';

update public.profiles set
  university = 'SUTD', major = 'Engineering Systems and Design', year = 'Y1', gender = 'Woman',
  personality = 'Extrovert', prefer_working = 'Face-to-face', best_work_time = 'In the day time', location = 'On Campus',
  skills = array['Python','Figma','Research'], interests = array['Sustainability','Social Impact','EdTech'],
  avatar_url = 'https://randomuser.me/api/portraits/women/12.jpg',
  bio = 'Freshie trying to save the planet one group project at a time. Will bring snacks to every meeting.'
where id = 'a0000000-0000-0000-0000-000000000005';

update public.profiles set
  university = 'NUS', major = 'Business Analytics', year = 'Y4', gender = 'Man',
  personality = 'Introvert', prefer_working = 'Online', best_work_time = 'In the day time', location = 'Central',
  skills = array['SQL','Python','Product'], interests = array['Data Science','EdTech','Web Dev'],
  avatar_url = 'https://randomuser.me/api/portraits/men/56.jpg',
  bio = 'Spreadsheets are my love language. Also I make a mean cup of pour-over.'
where id = 'a0000000-0000-0000-0000-000000000006';

update public.profiles set
  university = 'NTU', major = 'Information Engineering and Media', year = 'Y2', gender = 'Woman',
  personality = 'Extrovert', prefer_working = 'Face-to-face', best_work_time = 'At night', location = 'South',
  skills = array['React','Node.js','TypeScript'], interests = array['Web Dev','EdTech','Design'],
  avatar_url = 'https://randomuser.me/api/portraits/women/33.jpg',
  bio = 'Building the app I wish existed when I was a lost exchange student.'
where id = 'a0000000-0000-0000-0000-000000000007';

update public.profiles set
  university = 'SUTD', major = 'Computer Science', year = 'Y3', gender = 'Man',
  personality = 'Introvert', prefer_working = 'Online', best_work_time = 'At night', location = 'East',
  skills = array['PyTorch','TensorFlow','Python'], interests = array['AI & ML','Data Science','Robotics'],
  avatar_url = 'https://randomuser.me/api/portraits/men/78.jpg',
  bio = 'Training models by day, losing to them at chess by night.'
where id = 'a0000000-0000-0000-0000-000000000008';

update public.profiles set
  university = null, major = 'Interaction Design', year = 'Other', gender = 'Woman',
  personality = 'Introvert', prefer_working = 'Online', best_work_time = 'At night', location = 'West',
  skills = array['Figma','UI/UX','Design'], interests = array['Design','Sustainability','Healthcare'],
  avatar_url = 'https://randomuser.me/api/portraits/women/50.jpg',
  bio = 'Exchange student, professional over-thinker of button border-radius.'
where id = 'a0000000-0000-0000-0000-000000000009';

update public.profiles set
  university = 'NUS', major = 'Information Systems', year = 'Y1', gender = 'Man',
  personality = 'Extrovert', prefer_working = 'Face-to-face', best_work_time = 'In the day time', location = 'North',
  skills = array['JavaScript','React','SQL'], interests = array['Web Dev','EdTech','Data Science'],
  avatar_url = 'https://randomuser.me/api/portraits/men/15.jpg',
  bio = 'First-year, still figuring out git but very enthusiastic about it.'
where id = 'a0000000-0000-0000-0000-000000000010';

update public.profiles set
  university = 'NTU', major = 'Renaissance Engineering Programme', year = 'Y4', gender = 'Woman',
  personality = 'Introvert', prefer_working = 'Online', best_work_time = 'In the day time', location = 'Central',
  skills = array['Python','Research','SQL'], interests = array['Sustainability','Social Impact','Healthcare'],
  avatar_url = 'https://randomuser.me/api/portraits/women/60.jpg',
  bio = 'Half engineer, half policy nerd. Ask me about carbon accounting, I dare you.'
where id = 'a0000000-0000-0000-0000-000000000011';

update public.profiles set
  university = null, major = 'Robotics Engineering', year = 'Y2', gender = 'Prefer not to say',
  personality = 'Extrovert', prefer_working = 'Face-to-face', best_work_time = 'At night', location = 'South',
  skills = array['Java','C++','Docker'], interests = array['Robotics','AI & ML','EdTech'],
  avatar_url = 'https://randomuser.me/api/portraits/men/85.jpg',
  bio = 'On exchange from the other side of the world, still adjusting to the heat.'
where id = 'a0000000-0000-0000-0000-000000000012';

-- ------------------------------------------------------------
-- 4) Per-skill proficiency (Basic | Good | Expert) — mirrors each
--    profile's skills[] array above with real, varied levels.
-- ------------------------------------------------------------
insert into public.user_skills (user_id, skill_name, proficiency) values
  ('a0000000-0000-0000-0000-000000000001','Python','Expert'), ('a0000000-0000-0000-0000-000000000001','React','Good'), ('a0000000-0000-0000-0000-000000000001','SQL','Basic'),
  ('a0000000-0000-0000-0000-000000000002','Figma','Expert'), ('a0000000-0000-0000-0000-000000000002','UI/UX','Expert'), ('a0000000-0000-0000-0000-000000000002','JavaScript','Good'),
  ('a0000000-0000-0000-0000-000000000003','Java','Good'), ('a0000000-0000-0000-0000-000000000003','SQL','Expert'), ('a0000000-0000-0000-0000-000000000003','Python','Basic'),
  ('a0000000-0000-0000-0000-000000000004','C++','Expert'), ('a0000000-0000-0000-0000-000000000004','TensorFlow','Good'), ('a0000000-0000-0000-0000-000000000004','Docker','Basic'),
  ('a0000000-0000-0000-0000-000000000005','Python','Basic'), ('a0000000-0000-0000-0000-000000000005','Figma','Basic'), ('a0000000-0000-0000-0000-000000000005','Research','Basic'),
  ('a0000000-0000-0000-0000-000000000006','SQL','Expert'), ('a0000000-0000-0000-0000-000000000006','Python','Good'), ('a0000000-0000-0000-0000-000000000006','Product','Good'),
  ('a0000000-0000-0000-0000-000000000007','React','Good'), ('a0000000-0000-0000-0000-000000000007','Node.js','Good'), ('a0000000-0000-0000-0000-000000000007','TypeScript','Basic'),
  ('a0000000-0000-0000-0000-000000000008','PyTorch','Expert'), ('a0000000-0000-0000-0000-000000000008','TensorFlow','Expert'), ('a0000000-0000-0000-0000-000000000008','Python','Expert'),
  ('a0000000-0000-0000-0000-000000000009','Figma','Good'), ('a0000000-0000-0000-0000-000000000009','UI/UX','Good'), ('a0000000-0000-0000-0000-000000000009','Design','Basic'),
  ('a0000000-0000-0000-0000-000000000010','JavaScript','Basic'), ('a0000000-0000-0000-0000-000000000010','React','Basic'), ('a0000000-0000-0000-0000-000000000010','SQL','Basic'),
  ('a0000000-0000-0000-0000-000000000011','Python','Good'), ('a0000000-0000-0000-0000-000000000011','Research','Good'), ('a0000000-0000-0000-0000-000000000011','SQL','Basic'),
  ('a0000000-0000-0000-0000-000000000012','Java','Basic'), ('a0000000-0000-0000-0000-000000000012','C++','Basic'), ('a0000000-0000-0000-0000-000000000012','Docker','Basic');

-- ------------------------------------------------------------
-- 5) Projects — 4 Academic (course_code/instructor set, multi-group
--    capable) + 4 Personal, across all 3 privacy tiers, 3 already
--    Ended (past timeline) so ratings/past-projects have somewhere
--    real to come from, 5 still Active/recruiting.
-- ------------------------------------------------------------
insert into public.projects (id, owner_id, name, description, type, skills_needed, interests, min_size, max_size, timeline_start, timeline_end, privacy, joining_method, project_link, allow_multiple_groups, course_code, instructor, things_to_note, cover_image_url, photo_url, join_code) values
('b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','NeuralCompanion',
 'An AI study buddy that quizzes you based on your own lecture notes instead of generic flashcards. Built for finals season, by people who''ve suffered through finals season.',
 'academic', array['Python','React','AI/ML'], array['AI & ML','Data Science'], 2, 5, '2026-09-01','2026-12-10',
 'restricted','approval', 'https://github.com/example/neuralcompanion', true,
 '50.038 Computational Data Science', 'Prof. Dorien Herremans',
 'Weekly sync Wed 6pm on Discord, async the rest of the week. We use Notion for task tracking.',
 'https://picsum.photos/seed/neuralcompanion/800/400', 'https://picsum.photos/seed/neuralcompanion-sq/300/300', 'GRV-NEURA'),

('b0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000005','EcoTrack Campus',
 'Tracks your carbon footprint around campus — canteen food choices, aircon habits, the works. Built for our Sustainable Design module, kept going because it was actually useful.',
 'academic', array['React','Figma','Python'], array['Sustainability','Social Impact'], 2, 4, '2026-02-01','2026-05-15',
 'public','approval', 'https://github.com/example/ecotrack', true,
 '01.102 Sustainable Design', 'Prof. Sarah Chua',
 'Wrapped up for the module deadline — still poking at it for fun.',
 'https://picsum.photos/seed/ecotrackcampus/800/400', 'https://picsum.photos/seed/ecotrackcampus-sq/300/300', 'GRV-ECOTR'),

('b0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000003','MediMate',
 'A symptom-checker chatbot from a healthcare hackathon. Not trying to replace doctors, just trying to stop your friends from Googling their symptoms at 3am.',
 'personal', array['Java','SQL','Python'], array['Healthcare','Data Science'], 2, 4, '2026-01-10','2026-03-20',
 'public','approval', 'https://github.com/example/medimate', false,
 null, null, 'Hackathon project — dormant now but happy to hand it off if anyone wants to build on it.',
 'https://picsum.photos/seed/medimate/800/400', 'https://picsum.photos/seed/medimate-sq/300/300', 'GRV-MEDIM'),

('b0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000004','RoboSoccer Bot',
 'Autonomous soccer-playing robot for the EE4308 final competition. Currently 60% functional, 40% duct tape.',
 'academic', array['C++','TensorFlow','Docker'], array['Robotics','AI & ML'], 2, 4, '2026-09-15','2027-01-20',
 'invite-only','approval', null, true,
 'EE4308 Autonomous Robots', 'Prof. Rodney Teo',
 'In-person builds Fri afternoons at the robotics lab, bring your own screwdriver set.',
 'https://picsum.photos/seed/robosoccer/800/400', 'https://picsum.photos/seed/robosoccer-sq/300/300', 'GRV-ROBOT'),

('b0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000007','CampusConnect',
 'A lightweight app to help exchange and incoming students find study groups, flatmates and people to eat with. Orientation week is chaos and everyone''s lost.',
 'personal', array['React','Node.js','TypeScript'], array['Web Dev','EdTech','Social Impact'], 3, 6, '2026-08-01','2026-11-30',
 'public','approval', 'https://campusconnect.example.com', false,
 null, null, 'Open to anyone regardless of school — this one''s meant to cross campuses.',
 'https://picsum.photos/seed/campusconnect/800/400', 'https://picsum.photos/seed/campusconnect-sq/300/300', 'GRV-CAMPU'),

('b0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000002','Pixel Portfolio',
 'A no-code-ish portfolio site builder for design students who don''t want to touch a single line of CSS. Personal project, might actually ship it.',
 'personal', array['Figma','UI/UX','JavaScript'], array['Design','EdTech'], 1, 2, '2026-08-10','2026-10-01',
 'public','auto', 'https://pixelportfolio.example.com', false,
 null, null, 'Looking for one more person, ideally someone who actually likes writing CSS.',
 'https://picsum.photos/seed/pixelportfolio/800/400', 'https://picsum.photos/seed/pixelportfolio-sq/300/300', 'GRV-PIXEL'),

('b0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000006','DataViz Insights',
 'Interactive dashboards for a business analytics module — scraping and visualizing real e-commerce data instead of the usual toy datasets.',
 'academic', array['SQL','Python','Product'], array['Data Science','EdTech'], 2, 4, '2026-08-20','2026-12-01',
 'restricted','approval', null, true,
 'BT4222 Mining Web Data for Business Insights', 'Prof. Kyong Jin Shim',
 'Data pulls run overnight, check the shared drive each morning for fresh CSVs.',
 'https://picsum.photos/seed/datavizinsights/800/400', 'https://picsum.photos/seed/datavizinsights-sq/300/300', 'GRV-DVIZI'),

('b0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000008','OrientMate',
 '24-hour hackathon build — a scavenger-hunt style app for freshmen orientation week. We shipped it at 6am on 3 hours of sleep and somehow it worked.',
 'personal', array['Figma','Python','Java'], array['EdTech','AI & ML'], 2, 3, '2026-01-05','2026-01-25',
 'public','approval', null, false,
 null, null, 'Hackathon''s over but it''s a fun one to look back on.',
 'https://picsum.photos/seed/orientmate/800/400', 'https://picsum.photos/seed/orientmate-sq/300/300', 'GRV-ORIEN');

-- ------------------------------------------------------------
-- 6) One group per project. Ended groups (2, 3, 8) close out the
--    projects whose timeline has already passed; the rest are
--    Forming/recruiting with real skills/interests/personality wanted.
-- ------------------------------------------------------------
insert into public.groups (id, project_id, name, leader_id, recruiting, status, min_members, max_members, members_wanted, skills_wanted, personality_wanted, interests_wanted, joining_method, additional_notes) values
('c0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','Team Neural','a0000000-0000-0000-0000-000000000001', true, 'Forming', 2, 5, 2, array['Python','React'], array[]::text[], array['AI & ML'], 'approval', 'Ideally someone comfortable with PyTorch or TensorFlow, but happy to teach.'),
('c0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000002','Green Team','a0000000-0000-0000-0000-000000000005', false, 'Ended', 2, 4, 0, array[]::text[], array[]::text[], array[]::text[], 'approval', null),
('c0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000003','MediMate Core','a0000000-0000-0000-0000-000000000003', false, 'Ended', 2, 4, 0, array[]::text[], array[]::text[], array[]::text[], 'approval', null),
('c0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000004','RoboSoccer Squad','a0000000-0000-0000-0000-000000000004', true, 'Forming', 2, 4, 2, array['C++','Docker'], array[]::text[], array['Robotics'], 'approval', 'Share the join code with anyone from the module, that''s how we''re recruiting.'),
('c0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000005','CampusConnect Crew','a0000000-0000-0000-0000-000000000007', true, 'Forming', 3, 6, 3, array['React','Node.js'], array[]::text[], array['Web Dev'], 'approval', null),
('c0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000006','Pixel Crew','a0000000-0000-0000-0000-000000000002', true, 'Forming', 1, 2, 1, array['Figma','UI/UX'], array[]::text[], array['Design'], 'auto', 'Auto-accept, just come with a portfolio link.'),
('c0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000007','Insight Squad','a0000000-0000-0000-0000-000000000006', true, 'Forming', 2, 4, 2, array['SQL','Python'], array[]::text[], array['Data Science'], 'approval', null),
('c0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000008','OrientMate Duo','a0000000-0000-0000-0000-000000000008', false, 'Ended', 2, 3, 0, array[]::text[], array[]::text[], array[]::text[], 'approval', null);

insert into public.group_members (group_id, user_id, role) values
('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','leader'),
('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000008','member'),
('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000005','member'),

('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000005','leader'),
('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000011','member'),
('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000009','member'),

('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000003','leader'),
('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000007','member'),
('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','member'),

('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000004','leader'),
('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000012','member'),

('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000007','leader'),
('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000010','member'),
('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000009','member'),

('c0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000002','leader'),

('c0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000006','leader'),
('c0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000010','member'),

('c0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000008','leader'),
('c0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000002','member'),
('c0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000012','member');

-- Project roster: every group member + every owner is a project member —
-- same backfill schema_v4.sql used, reused here so the privacy RLS's
-- membership check (schema_v13.sql) actually recognizes them.
insert into public.project_members (project_id, user_id)
select g.project_id, gm.user_id from public.group_members gm join public.groups g on g.id = gm.group_id
on conflict do nothing;
insert into public.project_members (project_id, user_id)
select p.id, p.owner_id from public.projects p
on conflict do nothing;

-- ------------------------------------------------------------
-- 7) Past projects — everyone gets one entry linked to a real ended
--    project they were actually on, plus one freestanding entry
--    (earlier hackathon/personal work with no project record).
-- ------------------------------------------------------------
insert into public.past_projects (user_id, project_id, role, write_up) values
-- linked to Ended projects
('a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000002','Team Lead','Led the Green Team, mostly kept everyone on schedule and argued for dark mode.'),
('a0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000002','Data & Backend','Wired up the carbon-footprint calculations and the campus canteen data.'),
('a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000002','UI Designer','Designed the dashboard — first time using a design system that wasn''t just me.'),
('a0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000003','Team Lead','Ran the MediMate team through a 48hr hackathon on minimal sleep and worse coffee.'),
('a0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000003','Frontend','Built the whole chat UI in a weekend, still proud of it.'),
('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000003','ML Engineer','Trained the symptom-classification model, embarrassingly small dataset but it worked.'),
('a0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000008','Backend & ML','Built the scavenger-hunt logic and the clue-matching model overnight.'),
('a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000008','Designer','Designed the whole thing between 2am and 6am, don''t ask how.'),
('a0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000008','QA & Demo','Tested every scavenger clue myself at 5am so freshmen wouldn''t get stuck.'),
-- freestanding, one each for everyone (no linked project — earlier work,
-- exactly what past_projects.project_id being nullable is for)
('a0000000-0000-0000-0000-000000000001', null, 'Hackathon Participant', 'NUS-SUTD hack weekend — built a lecture-recording summarizer in 24 hours, placed top 5.'),
('a0000000-0000-0000-0000-000000000002', null, 'Freelance Designer', 'Redesigned the UI for a friend''s F&B startup app, still gets used today.'),
('a0000000-0000-0000-0000-000000000003', null, 'CCA Web Lead', 'Ran the sign-up + events site for my CCA for two semesters.'),
('a0000000-0000-0000-0000-000000000004', null, 'Robotics Club Member', 'Helped build a line-following bot for an inter-uni robotics showcase.'),
('a0000000-0000-0000-0000-000000000005', null, 'Volunteer Dev', 'Built a small sign-up form for a beach cleanup NGO, first "real" deployed thing I made.'),
('a0000000-0000-0000-0000-000000000006', null, 'Data Intern', 'Summer internship building internal sales dashboards, first time working with a real messy dataset.'),
('a0000000-0000-0000-0000-000000000007', null, 'UI Designer', 'Designed a mobile app concept for a student wellness app as a personal project.'),
('a0000000-0000-0000-0000-000000000008', null, 'Kaggle Competitor', 'Placed in the top 10% of a Kaggle image classification competition, mostly for the bragging rights.'),
('a0000000-0000-0000-0000-000000000009', null, 'Design Intern', 'Interned at a small design studio back home before coming on exchange.'),
('a0000000-0000-0000-0000-000000000010', null, 'Personal Project', 'Built a simple expense tracker to learn React — nothing fancy, but it works.'),
('a0000000-0000-0000-0000-000000000011', null, 'Research Assistant', 'Helped a professor collect and clean data on campus energy usage for a paper.'),
('a0000000-0000-0000-0000-000000000012', null, 'Exchange Project', 'Built a small robot arm demo for a robotics showcase at my home university.');

-- ------------------------------------------------------------
-- 8) Ratings — cross-rated within the 3 Ended groups (every pair rates
--    each other), plus a handful of standalone ratings for the 3 people
--    not on an Ended group, so all 12 profiles show real ratings.
-- ------------------------------------------------------------
insert into public.ratings (rater_id, ratee_id, project_id, group_id, stars, comment) values
-- Green Team (Devi, Chloe, Grace) — b...02 / c...02
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Chloe''s sustainability data was clutch, super reliable.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Devi kept us all on track, great leader for a Y1.'),
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',4,'Grace''s UI made the dashboard actually usable.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Devi''s the best project lead I''ve worked with here.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',4,'Solid work, a bit quiet in meetings but always delivers.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Chloe''s data work was rock solid.'),
-- MediMate Core (Aisyah, Farah, Priya) — b...03 / c...03
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',5,'Farah''s frontend work was incredible, fast turnaround under pressure.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',5,'Aisyah''s the glue that held MediMate together.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',4,'Priya''s model work was solid, wish she''d made more of the syncs.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',5,'Best team lead I''ve had, super organized.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',4,'Good collaborator, a bit hard to reach sometimes.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',5,'Farah''s UI skills are unreal.'),
-- OrientMate Duo (Jun Hao, Marcus, Ben) — b...08 / c...08
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',5,'Marcus designed the whole thing overnight, insane work ethic.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',4,'Jun Hao''s backend was solid, communication could''ve been better.'),
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',4,'Ben brought good energy to a stressful hackathon weekend.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',5,'Jun Hao carried the ML side, legend.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',4,'Reliable teammate, good sport about the all-nighter.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',5,'Marcus''s designs made us stand out from every other team there.'),
-- Standalone — Wei Jian, Ryan, Haziq aren't on any Ended group yet, still
-- get real ratings from current teammates so all 12 profiles show one.
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000004',null,5,'Wei Jian''s C++ is clean, learning a lot working with him.'),
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000007',null,4,'Ryan knows his SQL, great to have as a mentor as a Y1.'),
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000007',null,4,'Haziq''s eager to learn, solid effort for someone just starting out.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000005',null,5,'Haziq picked up React fast, great addition to the team.');

-- ------------------------------------------------------------
-- 9) Join requests — pending + one declined-with-reason, so Applicants/
--    Teams·Requested aren't empty either.
-- ------------------------------------------------------------
insert into public.join_requests (group_id, user_id, status, note, comment, decline_reason, declined_at) values
('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000009','declined', null, null, 'Looking for someone with more robotics/embedded experience specifically for this one.', now() - interval '1 day'),
('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000011','pending', 'I''d love to help with the sustainability angle of this, I have some relevant coursework.', 'I''d love to help with the sustainability angle of this, I have some relevant coursework.', null, null),
('c0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000006','pending', null, null, null, null),
('c0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000005','pending', 'Interested in the data viz side, have some Python experience.', 'Interested in the data viz side, have some Python experience.', null, null);

-- ------------------------------------------------------------
-- 10) Saved projects.
-- ------------------------------------------------------------
insert into public.project_favorites (user_id, project_id) values
('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000004'),
('a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000006'),
('a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000001');

-- ------------------------------------------------------------
-- Done. Verify:
--   select username, full_name, university, array_length(skills,1) as n_skills from public.profiles order by full_name;
--   select name, type, privacy, join_code from public.projects order by name;
--   select ratee_id, count(*), round(avg(stars),1) from public.ratings group by ratee_id;
-- ------------------------------------------------------------
