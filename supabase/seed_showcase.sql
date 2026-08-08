-- ============================================================
-- Groovp — full showcase reseed, v4 (SUTD + NUS, built for a web
-- experiment where a brand-new user signs up with their OWN email and
-- has to: 1) create a profile, 2) find a project, 3) compare groups
-- within it, 4) request to join one. Everything below is shaped
-- around that flow specifically, not just data completeness:
--   - Every project is Public privacy and currently recruiting — none
--     are "Ended." A brand-new participant has no university match, so
--     a Restricted project would just be invisible to them, and an
--     Ended one has nothing to join. Every single project here is a
--     real, live option.
--   - Each project has 2 real groups already populated with seeded
--     members (never just a lone leader), and each group has a
--     genuinely different vibe — "Chill" (daytime/face-to-face/
--     extrovert, lighter skill ask) vs "Intense" (night-owl/online/
--     introvert, heavier ask) — recruiting different kinds of people,
--     so picking a group is an actual decision. No group is full.
--
-- ⚠️ DESTRUCTIVE: wipes every account and every piece of app data,
-- then recreates 15 profiles (10 SUTD across all 5 pillars — EPD, ESD,
-- CSD, DAI, ASD — plus 5 NUS) and 10 projects. Every profile gets a
-- photo, full personality, 2 real past projects, and 5-6 real ratings
-- from actual former teammates (not filler) — that history is kept
-- freestanding (no project_id) since none of the current 10 projects
-- are "past" ones for it to attach to.
--
-- Login for ANY of the 15 pre-seeded accounts: password test1234,
-- emails below. The actual experiment participant signs up fresh
-- through the real /signup flow with their own email — this script
-- only sets up the world they land in, not their own account.
--
-- One thing I can't verify from here: the exact `auth.users`/
-- `auth.identities` column set for THIS Supabase project's current
-- schema version. If it errors, tell me the message — nothing else in
-- the script depends on guessing that part right, and since it wipes-
-- then-seeds, a full retry after a fix is clean.
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
-- 1) University domains — SUTD + NUS only, per this batch's scope.
-- ------------------------------------------------------------
insert into public.university_domains (domain, university) values
  ('sutd.edu.sg', 'SUTD'),
  ('u.nus.edu',   'NUS'),
  ('nus.edu.sg',  'NUS')
on conflict (domain) do nothing;

-- ------------------------------------------------------------
-- 2) 15 auth accounts. Same password for all: test1234.
--    a...0001-0010 = SUTD (2 per pillar: EPD, ESD, CSD, DAI, ASD)
--    a...0011-0015 = NUS
-- ------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000001','authenticated','authenticated','aiden.koh@sutd.edu.sg',     crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aiden Koh","username":"aiden_koh"}',         now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000002','authenticated','authenticated','nabila.yusof@sutd.edu.sg',  crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nabila Yusof","username":"nabila_yusof"}',   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000003','authenticated','authenticated','devi.nair@sutd.edu.sg',     crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Devi Nair","username":"devi_nair"}',         now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000004','authenticated','authenticated','kaizhi.ong@sutd.edu.sg',    crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kai Zhi Ong","username":"kaizhi_ong"}',      now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000005','authenticated','authenticated','priya.sharma@sutd.edu.sg',  crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Sharma","username":"priya_sharma"}',   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000006','authenticated','authenticated','junhao.ong@sutd.edu.sg',    crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jun Hao Ong","username":"junhao_ong"}',      now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000007','authenticated','authenticated','marcus.tan@sutd.edu.sg',    crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marcus Tan","username":"marcus_tan"}',       now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000008','authenticated','authenticated','farhana.ismail@sutd.edu.sg',crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Farhana Ismail","username":"farhana_ismail"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000009','authenticated','authenticated','chloe.wong@sutd.edu.sg',    crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Chloe Wong","username":"chloe_wong"}',       now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000010','authenticated','authenticated','weijian.lim@sutd.edu.sg',   crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Wei Jian Lim","username":"weijian_lim"}',    now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000011','authenticated','authenticated','ryan.koh@u.nus.edu',        crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ryan Koh","username":"ryan_koh"}',           now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000012','authenticated','authenticated','aisyah.rahman@u.nus.edu',   crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aisyah Rahman","username":"aisyah_rahman"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000013','authenticated','authenticated','haziq.rahman@u.nus.edu',    crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Haziq Rahman","username":"haziq_rahman"}',   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000014','authenticated','authenticated','grace.lim@u.nus.edu',       crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Grace Lim","username":"grace_lim"}',         now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000015','authenticated','authenticated','ben.foster@u.nus.edu',      crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ben Foster","username":"ben_foster"}',       now(), now(), '', '', '', '');

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email),
       'email', now(), now(), now()
from auth.users u
where u.id::text like 'a0000000-%';

-- ------------------------------------------------------------
-- 3) Profiles — pillar/major-themed skills, interests, bio.
--    EPD = Aiden, Nabila | ESD = Devi, Kai Zhi | CSD = Priya, Jun Hao |
--    DAI = Marcus, Farhana | ASD = Chloe, Wei Jian | NUS = the last 5.
-- ------------------------------------------------------------
update public.profiles set
  university='SUTD', major='EPD', year='Y3', gender='Man',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='On Campus',
  skills=array['Product','C++','Research'], interests=array['Robotics','Design','Sustainability'],
  avatar_url='https://randomuser.me/api/portraits/men/40.jpg',
  bio='EPD Y3, happiest when a prototype is half-disassembled on my desk. CAD by day, breadboard by night.'
where id='a0000000-0000-0000-0000-000000000001';

update public.profiles set
  university='SUTD', major='EPD', year='Y2', gender='Woman',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='East',
  skills=array['Product','AWS','Research'], interests=array['Sustainability','Social Impact','Robotics'],
  avatar_url='https://randomuser.me/api/portraits/women/22.jpg',
  bio='EPD Y2. Into product design that actually gets used, not just demoed once and shelved.'
where id='a0000000-0000-0000-0000-000000000002';

update public.profiles set
  university='SUTD', major='ESD', year='Y1', gender='Woman',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='On Campus',
  skills=array['Python','Research','SQL'], interests=array['Sustainability','Social Impact','Data Science'],
  avatar_url='https://randomuser.me/api/portraits/women/12.jpg',
  bio='ESD freshie trying to save the planet one group project at a time. Will bring snacks to every meeting.'
where id='a0000000-0000-0000-0000-000000000003';

update public.profiles set
  university='SUTD', major='ESD', year='Y4', gender='Man',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='Central',
  skills=array['Python','AWS','Research'], interests=array['Sustainability','Data Science','EdTech'],
  avatar_url='https://randomuser.me/api/portraits/men/52.jpg',
  bio='ESD senior. Spend too much time arguing that systems thinking applies to literally everything.'
where id='a0000000-0000-0000-0000-000000000004';

update public.profiles set
  university='SUTD', major='CSD', year='Y3', gender='Woman',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='Central',
  skills=array['Python','React','Node.js'], interests=array['AI & ML','Web Dev','Data Science'],
  avatar_url='https://randomuser.me/api/portraits/women/68.jpg',
  bio='CSD Y3, obsessed with LLMs and bad puns. Always down for a 2am debugging sesh with kopi in hand.'
where id='a0000000-0000-0000-0000-000000000005';

update public.profiles set
  university='SUTD', major='CSD', year='Y3', gender='Man',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='East',
  skills=array['Java','Docker','FastAPI'], interests=array['AI & ML','Data Science','Robotics'],
  avatar_url='https://randomuser.me/api/portraits/men/78.jpg',
  bio='CSD Y3. Training models by day, losing to them at chess by night.'
where id='a0000000-0000-0000-0000-000000000006';

update public.profiles set
  university='SUTD', major='DAI', year='Y4', gender='Man',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='South',
  skills=array['Figma','UI/UX','Python'], interests=array['Design','AI & ML','EdTech'],
  avatar_url='https://randomuser.me/api/portraits/men/32.jpg',
  bio='DAI senior, design nerd, night owl. Will redesign your app''s onboarding whether you ask or not.'
where id='a0000000-0000-0000-0000-000000000007';

update public.profiles set
  university='SUTD', major='DAI', year='Y2', gender='Woman',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='West',
  skills=array['PyTorch','TensorFlow','Figma'], interests=array['AI & ML','Design','EdTech'],
  avatar_url='https://randomuser.me/api/portraits/women/33.jpg',
  bio='DAI Y2, where design meets "why is my model still not converging." Both halves, equally.'
where id='a0000000-0000-0000-0000-000000000008';

update public.profiles set
  university='SUTD', major='ASD', year='Y4', gender='Woman',
  personality='Introvert', prefer_working='Online', best_work_time='In the day time', location='North',
  skills=array['Figma','Design','Research'], interests=array['Sustainability','Design','Social Impact'],
  avatar_url='https://randomuser.me/api/portraits/women/60.jpg',
  bio='ASD senior. Half architect, half policy nerd. Ask me about passive cooling, I dare you.'
where id='a0000000-0000-0000-0000-000000000009';

update public.profiles set
  university='SUTD', major='ASD', year='Y3', gender='Man',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='West',
  skills=array['Figma','Research','AWS'], interests=array['Sustainability','Design','Robotics'],
  avatar_url='https://randomuser.me/api/portraits/men/45.jpg',
  bio='ASD Y3, into sustainable housing and the occasional generative-design rabbit hole.'
where id='a0000000-0000-0000-0000-000000000010';

update public.profiles set
  university='NUS', major='Business Analytics', year='Y4', gender='Man',
  personality='Introvert', prefer_working='Online', best_work_time='In the day time', location='Central',
  skills=array['SQL','Business','Product'], interests=array['Data Science','EdTech','Web Dev'],
  avatar_url='https://randomuser.me/api/portraits/men/56.jpg',
  bio='Business Analytics Y4. Spreadsheets are my love language. Also I make a mean cup of pour-over.'
where id='a0000000-0000-0000-0000-000000000011';

update public.profiles set
  university='NUS', major='Computer Science', year='Y2', gender='Woman',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='South',
  skills=array['Python','Java','AWS'], interests=array['AI & ML','Data Science','Healthcare'],
  avatar_url='https://randomuser.me/api/portraits/women/21.jpg',
  bio='CS Y2. Trying to build things that actually help people, one buggy prototype at a time.'
where id='a0000000-0000-0000-0000-000000000012';

update public.profiles set
  university='NUS', major='Information Systems', year='Y1', gender='Man',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='North',
  skills=array['JavaScript','React','SQL'], interests=array['Web Dev','EdTech','Data Science'],
  avatar_url='https://randomuser.me/api/portraits/men/15.jpg',
  bio='IS Y1, still figuring out git but very enthusiastic about it.'
where id='a0000000-0000-0000-0000-000000000013';

update public.profiles set
  university='NUS', major='Data Science and Analytics', year='Y3', gender='Woman',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='Central',
  skills=array['TensorFlow','PyTorch','SQL'], interests=array['AI & ML','Data Science','Healthcare'],
  avatar_url='https://randomuser.me/api/portraits/women/50.jpg',
  bio='DSA Y3. If it can''t be cross-validated I don''t trust it, including my own life choices.'
where id='a0000000-0000-0000-0000-000000000014';

update public.profiles set
  university='NUS', major='Industrial Design', year='Y2', gender='Prefer not to say',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='At night', location='South',
  skills=array['Figma','UI/UX','Design'], interests=array['Design','Sustainability','Social Impact'],
  avatar_url='https://randomuser.me/api/portraits/men/85.jpg',
  bio='Industrial Design Y2. Furniture, packaging, whatever needs a form that actually makes sense.'
where id='a0000000-0000-0000-0000-000000000015';

-- ------------------------------------------------------------
-- 4) Per-skill proficiency (Basic | Good | Expert), mirrors skills[] above.
-- ------------------------------------------------------------
insert into public.user_skills (user_id, skill_name, proficiency) values
  ('a0000000-0000-0000-0000-000000000001','Product','Expert'), ('a0000000-0000-0000-0000-000000000001','C++','Good'), ('a0000000-0000-0000-0000-000000000001','Research','Basic'),
  ('a0000000-0000-0000-0000-000000000002','Product','Good'), ('a0000000-0000-0000-0000-000000000002','AWS','Basic'), ('a0000000-0000-0000-0000-000000000002','Research','Good'),
  ('a0000000-0000-0000-0000-000000000003','Python','Basic'), ('a0000000-0000-0000-0000-000000000003','Research','Basic'), ('a0000000-0000-0000-0000-000000000003','SQL','Basic'),
  ('a0000000-0000-0000-0000-000000000004','Python','Good'), ('a0000000-0000-0000-0000-000000000004','AWS','Good'), ('a0000000-0000-0000-0000-000000000004','Research','Expert'),
  ('a0000000-0000-0000-0000-000000000005','Python','Expert'), ('a0000000-0000-0000-0000-000000000005','React','Good'), ('a0000000-0000-0000-0000-000000000005','Node.js','Basic'),
  ('a0000000-0000-0000-0000-000000000006','Java','Expert'), ('a0000000-0000-0000-0000-000000000006','Docker','Good'), ('a0000000-0000-0000-0000-000000000006','FastAPI','Good'),
  ('a0000000-0000-0000-0000-000000000007','Figma','Expert'), ('a0000000-0000-0000-0000-000000000007','UI/UX','Expert'), ('a0000000-0000-0000-0000-000000000007','Python','Good'),
  ('a0000000-0000-0000-0000-000000000008','PyTorch','Good'), ('a0000000-0000-0000-0000-000000000008','TensorFlow','Good'), ('a0000000-0000-0000-0000-000000000008','Figma','Basic'),
  ('a0000000-0000-0000-0000-000000000009','Figma','Good'), ('a0000000-0000-0000-0000-000000000009','Design','Good'), ('a0000000-0000-0000-0000-000000000009','Research','Expert'),
  ('a0000000-0000-0000-0000-000000000010','Figma','Good'), ('a0000000-0000-0000-0000-000000000010','Research','Basic'), ('a0000000-0000-0000-0000-000000000010','AWS','Basic'),
  ('a0000000-0000-0000-0000-000000000011','SQL','Expert'), ('a0000000-0000-0000-0000-000000000011','Business','Good'), ('a0000000-0000-0000-0000-000000000011','Product','Basic'),
  ('a0000000-0000-0000-0000-000000000012','Python','Basic'), ('a0000000-0000-0000-0000-000000000012','Java','Good'), ('a0000000-0000-0000-0000-000000000012','AWS','Basic'),
  ('a0000000-0000-0000-0000-000000000013','JavaScript','Basic'), ('a0000000-0000-0000-0000-000000000013','React','Basic'), ('a0000000-0000-0000-0000-000000000013','SQL','Basic'),
  ('a0000000-0000-0000-0000-000000000014','TensorFlow','Good'), ('a0000000-0000-0000-0000-000000000014','PyTorch','Basic'), ('a0000000-0000-0000-0000-000000000014','SQL','Good'),
  ('a0000000-0000-0000-0000-000000000015','Figma','Good'), ('a0000000-0000-0000-0000-000000000015','UI/UX','Good'), ('a0000000-0000-0000-0000-000000000015','Design','Basic');

-- ------------------------------------------------------------
-- 5) 10 projects. Every one Public privacy, currently recruiting, real
--    future timeline (nothing "Ended"). 5 academic (course_code/
--    instructor set) + 5 personal.
-- ------------------------------------------------------------
insert into public.projects (id, owner_id, name, description, type, skills_needed, interests, min_size, max_size, timeline_start, timeline_end, privacy, joining_method, project_link, allow_multiple_groups, course_code, instructor, things_to_note, cover_image_url, photo_url, join_code) values

('b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000005','NeuralCompanion',
 'An AI study buddy that quizzes you based on your own lecture notes instead of generic flashcards, so revision actually matches what''s on your slides instead of a generic question bank. Two sub-teams are running in parallel right now — one on the model side, one making sure the thing is actually pleasant to use.',
 'academic', array['Python','React','AI/ML'], array['AI & ML','Data Science'], 4, 9, '2026-09-01','2026-12-15',
 'public','approval', 'https://github.com/example/neuralcompanion', true, '50.038 Computational Data Science', 'Prof. Dorien Herremans',
 'Two active groups below — pick whichever pace suits you, both report into the same weekly demo.',
 'https://picsum.photos/seed/neuralcompanion2/800/400','https://picsum.photos/seed/neuralcompanion2-sq/300/300','GRV-NEUR2'),

('b0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003','EcoTrack Campus',
 'Tracks your carbon footprint around campus — canteen food choices, aircon habits, printing — and nudges you toward greener defaults without being preachy about it. Split into a data-crunching side and a design side, both still filling out.',
 'academic', array['Python','Figma','SQL'], array['Sustainability','Social Impact'], 4, 8, '2026-09-05','2026-12-10',
 'public','approval', null, true, '01.102 Sustainable Design', 'Prof. Sarah Chua',
 'Weekly studio slot Thursdays, plus async check-ins the rest of the week.',
 'https://picsum.photos/seed/ecotrackcampus2/800/400','https://picsum.photos/seed/ecotrackcampus2-sq/300/300','GRV-ECOT2'),

('b0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000012','HealthBridge',
 'A triage-assistant chatbot that helps route people to the right kind of clinic before they even call — built for a telehealth startup competition, still actively developed with the pitch deadline a few months out.',
 'academic', array['Java','AI/ML','AWS'], array['Healthcare','AI & ML'], 4, 8, '2026-08-25','2026-12-05',
 'public','approval', null, true, 'BT4222 Mining Web Data for Business Insights', 'Prof. Kyong Jin Shim',
 'Data pulls run overnight, check the shared drive each morning for fresh CSVs.',
 'https://picsum.photos/seed/healthbridge2/800/400','https://picsum.photos/seed/healthbridge2-sq/300/300','GRV-HLTH2'),

('b0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000013','CampusConnect',
 'Helps new and exchange students find study groups, flatmates and people to eat with during orientation week, when everyone''s overwhelmed and half the campus apps are still confusing. Open to any school — that''s the whole point of the tool.',
 'personal', array['React','Node.js','SQL'], array['Web Dev','Social Impact'], 4, 10, '2026-08-01','2026-12-20',
 'public','approval', 'https://campusconnect.example.com', true, null, null,
 'Fully cross-school by design — Discord for async chat, weekly voice sync Sundays.',
 'https://picsum.photos/seed/campusconnect2/800/400','https://picsum.photos/seed/campusconnect2-sq/300/300','GRV-CMPU2'),

('b0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001','AutoBrew',
 'Retrofitting the office coffee machine with a scheduling app and a usage-prediction model, so it''s never empty right before a deadline crunch. Hardware side and software side are separate groups that meet up to integrate every other week.',
 'academic', array['Product','C++','Research'], array['Robotics','Sustainability'], 4, 9, '2026-09-10','2026-12-18',
 'public','approval', null, true, '03.014 Design for Manufacture', 'Prof. Lin Wei',
 'Hardware access is in the EPD workshop, sign up for a slot on the shared calendar.',
 'https://picsum.photos/seed/autobrew2/800/400','https://picsum.photos/seed/autobrew2-sq/300/300','GRV-BREW2'),

('b0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000009','GreenBlueprint',
 'A sustainable-housing visualizer — plug in a floor plan, see estimated energy use and passive cooling potential before a single brick is laid. Research/modeling and on-site fieldwork are two different ways to contribute.',
 'personal', array['Figma','Research','Design'], array['Sustainability','Design'], 4, 9, '2026-08-15','2026-12-22',
 'public','approval', null, true, null, null,
 'Fieldwork group does occasional site visits, research group is fully remote-friendly.',
 'https://picsum.photos/seed/greenblueprint2/800/400','https://picsum.photos/seed/greenblueprint2-sq/300/300','GRV-GRBL2'),

('b0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000011','DataViz for Social Good',
 'Interactive dashboards for a local nonprofit, turning years of donation and volunteer spreadsheets into something their board can actually read at a glance. Analysts dig into the numbers, storytellers make sure the charts actually communicate.',
 'personal', array['SQL','Business','Figma'], array['Data Science','Social Impact'], 4, 9, '2026-08-20','2026-12-19',
 'public','approval', null, true, null, null,
 'Real client, real deadline — the nonprofit''s board meets quarterly and wants a demo each time.',
 'https://picsum.photos/seed/datavizsocial2/800/400','https://picsum.photos/seed/datavizsocial2-sq/300/300','GRV-DVSG2'),

('b0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000007','PixelPortfolio',
 'A no-code-ish portfolio site builder for design students who don''t want to touch a single line of CSS — still actively adding templates and a proper theme editor.',
 'personal', array['Figma','UI/UX','JavaScript'], array['Design','EdTech'], 4, 7, '2026-08-12','2026-12-01',
 'public','auto', 'https://pixelportfolio.example.com', true, null, null,
 'Design group is auto-accept — just show up with a portfolio link. Dev group is approval-based.',
 'https://picsum.photos/seed/pixelportfolio2/800/400','https://picsum.photos/seed/pixelportfolio2-sq/300/300','GRV-PIXL2'),

('b0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000010','CampusHeritage AR',
 'An AR walking tour overlaying old photos and stories onto current campus buildings, so freshmen stop calling the oldest block "the ugly one." Design/content side and the AR engineering side both still recruiting.',
 'personal', array['Figma','AWS','Research'], array['Sustainability','Social Impact'], 4, 9, '2026-08-05','2026-12-14',
 'public','approval', null, true, null, null,
 'Open cross-school, no heritage/AR experience required, just curiosity.',
 'https://picsum.photos/seed/campusheritage2/800/400','https://picsum.photos/seed/campusheritage2-sq/300/300','GRV-HRTG2'),

('b0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000004','PolicySim',
 'A lightweight simulator where you tweak one urban policy lever at a time and see rough downstream effects — built to make a policy module less abstract, and genuinely used by a couple of other students to study for exams now.',
 'academic', array['Python','Research','Business'], array['Social Impact','Data Science'], 4, 9, '2026-09-08','2026-12-16',
 'public','approval', null, true, '02.005 Systems Thinking', 'Prof. Fadel Digham',
 'Research group models the policy logic, comms group handles the write-ups and explainer content.',
 'https://picsum.photos/seed/policysim2/800/400','https://picsum.photos/seed/policysim2-sq/300/300','GRV-PLCY2');

-- ------------------------------------------------------------
-- 6) Groups — 2 per project, 20 total. Every group already has a
--    leader + 1 real member (never a lone leader), room to grow, and a
--    deliberately different vibe from its sibling group on the same
--    project: "Fast Track"/"Builders"/"Analysts" etc = Introvert/
--    Online/Night owl on a heavier skill ask; "Beginners"/"Design"/
--    "Comms" etc = Extrovert/Face-to-face/Morning on a lighter one.
-- ------------------------------------------------------------
insert into public.groups (id, project_id, name, leader_id, recruiting, status, min_members, max_members, members_wanted, skills_wanted, personality_wanted, interests_wanted, joining_method, additional_notes) values

-- NeuralCompanion
('c0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','Neural Fast Track','a0000000-0000-0000-0000-000000000005', true,'Forming',2,4,2,array['Python','AI/ML'],array['Introvert','Online','Night owl'],array['AI & ML'],'approval','Moving fast, mostly async at night — come comfortable with PyTorch or TensorFlow.'),
('c0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001','Neural Beginners','a0000000-0000-0000-0000-000000000013', true,'Forming',2,5,3,array['React','Python'],array['Extrovert','Face-to-face','Morning'],array['EdTech'],'approval','Relaxed pace, good for a first AI-adjacent project, happy to teach as we go.'),

-- EcoTrack Campus
('c0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000002','Green Data Team','a0000000-0000-0000-0000-000000000003', true,'Forming',2,4,2,array['Python','SQL'],array['Introvert','Online','Night owl'],array['Data Science'],'approval','Backend-focused, async, some Python expected.'),
('c0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000002','Green Design Team','a0000000-0000-0000-0000-000000000009', true,'Forming',2,4,2,array['Figma','Research'],array['Extrovert','Face-to-face','Morning'],array['Sustainability'],'approval','In-person studio sessions, beginner-friendly on the design side.'),

-- HealthBridge
('c0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000003','HealthBridge Data','a0000000-0000-0000-0000-000000000012', true,'Forming',2,3,2,array['TensorFlow','SQL'],array['Introvert','Online','Night owl'],array['AI & ML'],'approval','Deep in the model/data side, async and fast-moving.'),
('c0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000003','HealthBridge Frontend','a0000000-0000-0000-0000-000000000007', true,'Forming',2,5,3,array['Figma','Java'],array['Extrovert','Face-to-face','Morning'],array['Healthcare'],'approval','Daytime, UI-focused, beginner-friendly.'),

-- CampusConnect
('c0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000004','Connect Fullstack','a0000000-0000-0000-0000-000000000013', true,'Forming',2,4,2,array['React','Node.js'],array['Introvert','Online','Night owl'],array['Web Dev'],'approval','Fast-moving, mostly async, come comfortable with React.'),
('c0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000004','Connect Growth','a0000000-0000-0000-0000-000000000011', true,'Forming',2,6,4,array['Business','Product'],array['Extrovert','Face-to-face','Morning'],array['Social Impact'],'approval','Not just engineering — outreach, partnerships, getting the word out to other schools.'),

-- AutoBrew
('c0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000005','AutoBrew Builders','a0000000-0000-0000-0000-000000000001', true,'Forming',2,4,2,array['Product','C++'],array['Introvert','Online','Night owl'],array['Robotics'],'approval','Hands-on hardware work, moving fast toward a working prototype.'),
('c0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000005','AutoBrew Testers','a0000000-0000-0000-0000-000000000002', true,'Forming',2,5,3,array['Research','AWS'],array['Extrovert','Face-to-face','Morning'],array['Sustainability'],'approval','Usage-data and testing side, casual pace, good if you''re newer to product work.'),

-- GreenBlueprint
('c0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000006','Blueprint Studio','a0000000-0000-0000-0000-000000000009', true,'Forming',2,4,2,array['Figma','Research'],array['Introvert','Online','Night owl'],array['Design'],'approval','Deep-focus studio work, mostly solo synced async.'),
('c0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000006','Blueprint Fieldwork','a0000000-0000-0000-0000-000000000010', true,'Forming',2,5,3,array['Figma','AWS'],array['Extrovert','Face-to-face','Morning'],array['Sustainability'],'approval','Occasional site visits, casual pace, good for first-timers.'),

-- DataViz for Social Good
('c0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000007','DataViz Analysts','a0000000-0000-0000-0000-000000000011', true,'Forming',2,4,2,array['SQL','Business'],array['Introvert','Online','Night owl'],array['Data Science'],'approval','Numbers-focused, async, some SQL expected.'),
('c0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000007','DataViz Storytellers','a0000000-0000-0000-0000-000000000008', true,'Forming',2,5,3,array['Figma','Design'],array['Extrovert','Face-to-face','Morning'],array['Social Impact'],'approval','Visual/communication side, daytime, beginner-friendly.'),

-- PixelPortfolio
('c0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000008','Pixel Design','a0000000-0000-0000-0000-000000000007', true,'Forming',2,4,2,array['Figma','UI/UX'],array['Extrovert','Face-to-face','Morning'],array['Design'],'auto','Auto-accept, just come with a portfolio link.'),
('c0000000-0000-0000-0000-000000000016','b0000000-0000-0000-0000-000000000008','Pixel Dev','a0000000-0000-0000-0000-000000000015', true,'Forming',2,3,2,array['JavaScript','TypeScript'],array['Introvert','Online','Night owl'],array['EdTech'],'approval','Fast-moving on the template engine, come comfortable with JS.'),

-- CampusHeritage AR
('c0000000-0000-0000-0000-000000000017','b0000000-0000-0000-0000-000000000009','Heritage Walkers','a0000000-0000-0000-0000-000000000010', true,'Forming',2,5,3,array['Figma','Research'],array['Extrovert','Face-to-face','Morning'],array['Sustainability'],'approval','Casual, in-person walks around campus to scope AR spots.'),
('c0000000-0000-0000-0000-000000000018','b0000000-0000-0000-0000-000000000009','Heritage Tech','a0000000-0000-0000-0000-000000000004', true,'Forming',2,4,2,array['AWS','Research'],array['Introvert','Online','Night owl'],array['Social Impact'],'approval','AR engineering side, async, some cloud/backend experience useful.'),

-- PolicySim
('c0000000-0000-0000-0000-000000000019','b0000000-0000-0000-0000-000000000010','PolicySim Research','a0000000-0000-0000-0000-000000000004', true,'Forming',2,4,2,array['Python','Research'],array['Introvert','Online','Night owl'],array['Data Science'],'approval','Modeling-heavy, fast iteration, mostly async discussion.'),
('c0000000-0000-0000-0000-000000000020','b0000000-0000-0000-0000-000000000010','PolicySim Comms','a0000000-0000-0000-0000-000000000011', true,'Forming',2,5,3,array['Business','SQL'],array['Extrovert','Face-to-face','Morning'],array['Social Impact'],'approval','Write-ups and explainer content, daytime, beginner-friendly.');

-- ------------------------------------------------------------
-- 7) Group membership — every group starts with its leader + 1 real
--    member already in it (never a lone leader), well short of max,
--    genuinely recruiting.
-- ------------------------------------------------------------
insert into public.group_members (group_id, user_id, role) values
('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000005','leader'), ('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000006','member'),
('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000013','leader'), ('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000014','member'),
('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000003','leader'), ('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000004','member'),
('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000009','leader'), ('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000010','member'),
('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000012','leader'), ('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000014','member'),
('c0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000007','leader'), ('c0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000015','member'),
('c0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000013','leader'), ('c0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000005','member'),
('c0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000011','leader'), ('c0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000002','member'),
('c0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000001','leader'), ('c0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000010','member'),
('c0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000002','leader'), ('c0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000004','member'),
('c0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000009','leader'), ('c0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000015','member'),
('c0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000010','leader'), ('c0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000003','member'),
('c0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000011','leader'), ('c0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000013','member'),
('c0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000008','leader'), ('c0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000007','member'),
('c0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000007','leader'), ('c0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000008','member'),
('c0000000-0000-0000-0000-000000000016','a0000000-0000-0000-0000-000000000015','leader'), ('c0000000-0000-0000-0000-000000000016','a0000000-0000-0000-0000-000000000005','member'),
('c0000000-0000-0000-0000-000000000017','a0000000-0000-0000-0000-000000000010','leader'), ('c0000000-0000-0000-0000-000000000017','a0000000-0000-0000-0000-000000000009','member'),
('c0000000-0000-0000-0000-000000000018','a0000000-0000-0000-0000-000000000004','leader'), ('c0000000-0000-0000-0000-000000000018','a0000000-0000-0000-0000-000000000012','member'),
('c0000000-0000-0000-0000-000000000019','a0000000-0000-0000-0000-000000000004','leader'), ('c0000000-0000-0000-0000-000000000019','a0000000-0000-0000-0000-000000000003','member'),
('c0000000-0000-0000-0000-000000000020','a0000000-0000-0000-0000-000000000011','leader'), ('c0000000-0000-0000-0000-000000000020','a0000000-0000-0000-0000-000000000014','member');

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
-- 8) Past projects — everyone's real prior work, kept freestanding
--    (no project_id) since none of the current 10 projects are "past"
--    ones for it to link to. Two entries each, 30 total.
-- ------------------------------------------------------------
insert into public.past_projects (user_id, project_id, role, write_up) values
('a0000000-0000-0000-0000-000000000001',null,'Team Lead','Led SmartCart end to end — mechanical integration was the fun part, the wiring loom less so.'),
('a0000000-0000-0000-0000-000000000001',null,'ML Support','Helped tune MediMate''s symptom-classifier, small dataset but it held up.'),
('a0000000-0000-0000-0000-000000000002',null,'Prototyping','Built and rebuilt the trolley chassis about six times until it stopped tipping over.'),
('a0000000-0000-0000-0000-000000000002',null,'Logistics','Ran the clue-prop side of OrientMate, printed way too many QR codes.'),
('a0000000-0000-0000-0000-000000000003',null,'Data & Sensors','Wired up SmartCart''s obstacle sensors and logged way too many false positives on stray chairs.'),
('a0000000-0000-0000-0000-000000000003',null,'Data Cleaning','Cleaned three years of messy nonprofit spreadsheets for a community data dashboard.'),
('a0000000-0000-0000-0000-000000000004',null,'Systems Integration','Made sure SmartCart''s subsystems actually talked to each other, mostly.'),
('a0000000-0000-0000-0000-000000000004',null,'Cloud Setup','Set up the hosting for an earlier portfolio-builder project, first time actually using AWS for something real.'),
('a0000000-0000-0000-0000-000000000005',null,'Team Lead','Led an earlier AI study-buddy hackathon build, mostly kept the model training from eating our entire compute budget.'),
('a0000000-0000-0000-0000-000000000005',null,'Team Lead','Ran MediMate through a healthcare hackathon on minimal sleep and worse coffee.'),
('a0000000-0000-0000-0000-000000000006',null,'Team Lead','Led that same study-buddy build''s backend, spent way too long optimizing an endpoint that barely got called.'),
('a0000000-0000-0000-0000-000000000006',null,'Backend & ML','Built OrientMate''s clue-matching logic overnight, first hackathon win.'),
('a0000000-0000-0000-0000-000000000007',null,'Frontend & Design','Designed and built the study-buddy hackathon''s whole quiz UI in a weekend.'),
('a0000000-0000-0000-0000-000000000007',null,'Visual Design','Made an earlier nonprofit data dashboard actually legible, staff said it was the first chart they''d understood all year.'),
('a0000000-0000-0000-0000-000000000008',null,'ML Engineer','Trained a note-summarization model for that same hackathon build, still proud of the eval scores.'),
('a0000000-0000-0000-0000-000000000008',null,'Team Lead','Led an earlier portfolio-builder side-project into something people actually used.'),
('a0000000-0000-0000-0000-000000000009',null,'Team Lead','Led HackTheCity, coordinated four schools'' worth of sleep-deprived designers.'),
('a0000000-0000-0000-0000-000000000009',null,'UX Design','Designed MediMate''s chat interface so it didn''t feel like talking to a form.'),
('a0000000-0000-0000-0000-000000000010',null,'Design','Handled HackTheCity''s dashboard visuals, first time working with people outside SUTD.'),
('a0000000-0000-0000-0000-000000000010',null,'Team Lead','Led OrientMate, the most sleep-deprived I''ve ever been and proudest of a build.'),
('a0000000-0000-0000-0000-000000000011',null,'Data','Pulled and cleaned public transport data for HackTheCity''s dashboard.'),
('a0000000-0000-0000-0000-000000000011',null,'Team Lead','Led an earlier community data build for a local nonprofit, they''re still using it which feels good.'),
('a0000000-0000-0000-0000-000000000012',null,'Backend','Wired up HackTheCity''s data pipeline, my first proper cross-school team.'),
('a0000000-0000-0000-0000-000000000012',null,'QA','Tested an earlier portfolio-builder project across three browsers so nobody else had to.'),
('a0000000-0000-0000-0000-000000000013',null,'Frontend','Built CampusEats'' logging UI, first real app I shipped.'),
('a0000000-0000-0000-0000-000000000013',null,'QA & Demo','Ran the live demo for MediMate at the hackathon showcase, nerve-wracking but fun.'),
('a0000000-0000-0000-0000-000000000014',null,'Team Lead','Led CampusEats, model wasn''t perfect but the canteen operator actually adopted it.'),
('a0000000-0000-0000-0000-000000000014',null,'ML Support','Helped tune OrientMate''s clue-matching thresholds at about 4am.'),
('a0000000-0000-0000-0000-000000000015',null,'Design','Designed CampusEats'' portion-size icons so the logging felt less like a chore.'),
('a0000000-0000-0000-0000-000000000015',null,'Visual Design','Helped polish an earlier community data dashboard''s charts for a nonprofit board presentation.');

-- ------------------------------------------------------------
-- 9) Ratings — everyone's 5-6 real ratings from actual former
--    teammates on prior (unlisted, freestanding) work, same as the
--    past_projects above. Kept freestanding for the same reason.
-- ------------------------------------------------------------
insert into public.ratings (rater_id, ratee_id, project_id, group_id, stars, comment) values
-- prior team: Aiden, Nabila, Devi, Kai Zhi
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002',null,null,5,'Nabila rebuilt the chassis more times than I can count and never once complained.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001',null,null,5,'Aiden kept SmartCart from becoming five different half-finished ideas at once.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000003',null,null,4,'Devi''s sensor work was solid, the false-positive rate on stray chairs was not her fault.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001',null,null,5,'Great lead, always had a clear next step for everyone.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000004',null,null,5,'Kai Zhi''s systems integration saved us from three separate near-disasters.'),
('a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000001',null,null,4,'Solid lead, meetings occasionally ran long but always productive.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003',null,null,4,'Reliable, quiet but always delivered on time.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000002',null,null,5,'Nabila''s patience with the chassis redesigns was honestly impressive.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000004',null,null,5,'Kai Zhi''s the reason our subsystems didn''t fall apart at demo time.'),
('a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000002',null,null,4,'Good collaborator, very hands-on with the build.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000004',null,null,5,'Kai Zhi caught integration bugs nobody else would''ve noticed.'),
('a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000003',null,null,4,'Devi''s sensor calibration work was thorough, good documentation too.'),
-- prior team: Jun Hao, Priya, Marcus, Farhana
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000005',null,null,5,'Priya''s the reason the compute budget didn''t implode, great lead.'),
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000006',null,null,5,'Jun Hao''s backend work was rock solid, wish he joined more of the syncs though.'),
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000007',null,null,5,'Marcus built the whole UI in a weekend, insane turnaround.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000006',null,null,4,'Solid backend, communication could''ve been a bit more frequent.'),
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000008',null,null,5,'Farhana''s summarization model eval scores were genuinely impressive.'),
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000006',null,null,5,'Jun Hao carried the ML infra side, legend.'),
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000007',null,null,5,'Marcus''s UI made the whole app feel like a real product, not a hackathon build.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000005',null,null,5,'Best team lead I''ve had, super organized and always transparent about blockers.'),
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000008',null,null,4,'Farhana''s model work was solid, would''ve liked more frequent updates.'),
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000005',null,null,5,'Priya kept the whole project scoped and on track, great to work under.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000008',null,null,4,'Good collaborator, model explanations were always clear even to a design person.'),
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000007',null,null,5,'Marcus''s design sense elevated the whole product, would team up again anytime.'),
-- prior team: Chloe, Wei Jian, Ryan, Aisyah
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000010',null,null,5,'Wei Jian''s visuals made our dashboard stand out from every other team there.'),
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000009',null,null,5,'Chloe coordinated four schools'' worth of people without a single argument, impressive.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000011',null,null,4,'Ryan''s transport data pull saved us hours, good technical instincts.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000009',null,null,5,'Best cross-school lead I''ve worked with, kept four different schedules aligned.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000012',null,null,4,'Aisyah''s data pipeline work was clean, first cross-school team for both of us.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000009',null,null,5,'Chloe made a chaotic 36 hours feel organized, genuinely great leadership.'),
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000011',null,null,4,'Ryan''s data instincts were sharp even at 3am.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000010',null,null,5,'Wei Jian''s design work is why our submission actually looked finished.'),
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000012',null,null,4,'Solid backend work, quiet but consistent.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000010',null,null,5,'Wei Jian''s the reason our dashboard didn''t look like every other team''s.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000012',null,null,4,'Good with the data pipeline, would team up again.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000011',null,null,5,'Ryan led the data side really well, made a messy dataset feel manageable.'),
-- prior team: Grace, Haziq, Ben
('a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000013',null,null,5,'Haziq''s logging UI made the whole app feel far less chore-like.'),
('a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000014',null,null,5,'Grace led with a super clear scope even though the model wasn''t perfect.'),
('a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000015',null,null,5,'Ben''s portion-size icons made logging genuinely painless.'),
('a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000014',null,null,5,'Grace got the canteen operator to actually adopt this, rare for a module project.'),
('a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000015',null,null,4,'Ben''s design instincts are sharp, good collaborator.'),
('a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000013',null,null,4,'Haziq picked up the frontend fast for a Y1, solid work.'),
-- prior team: Priya, Aiden, Chloe, Haziq
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001',null,null,4,'Aiden''s model tuning helped a lot given the tiny dataset we had.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000005',null,null,5,'Priya ran a hackathon team like a pro, super calm under pressure.'),
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000009',null,null,5,'Chloe''s chat UI design made this feel like a real product, not a hackathon hack.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000005',null,null,5,'Priya''s the best lead I''ve had, super organized even on zero sleep.'),
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000013',null,null,4,'Haziq ran a nerve-wracking live demo really well.'),
('a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000005',null,null,5,'Priya''s leadership made my first hackathon way less intimidating.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000009',null,null,4,'Chloe''s UX instincts saved us from a clunky chat flow.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000001',null,null,4,'Aiden picked up the ML side fast for someone from EPD, solid effort.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000013',null,null,4,'Haziq handled the demo pressure better than I would have.'),
('a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000001',null,null,4,'Aiden''s tuning work was solid, good teammate under time pressure.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000013',null,null,5,'Haziq''s energy kept the team going through the all-nighter.'),
('a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000009',null,null,5,'Chloe''s design work is why judges actually remembered our demo.'),
-- prior team: Wei Jian, Nabila, Jun Hao, Grace
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000002',null,null,5,'Nabila printed approximately a thousand QR codes without complaint, hero behavior.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000010',null,null,5,'Wei Jian led us through the most sleep-deprived night of the semester, and we won.'),
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000006',null,null,5,'Jun Hao''s clue-matching logic just worked, first try, at 4am. Impressive.'),
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000010',null,null,5,'Wei Jian kept morale up when we were all running on fumes.'),
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000014',null,null,4,'Grace''s threshold tuning at 4am was better work than I could''ve done awake.'),
('a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000010',null,null,5,'Wei Jian''s the most sleep-deprived-but-still-organized lead I''ve worked with.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000006',null,null,4,'Solid backend work, clue logic barely ever broke.'),
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000002',null,null,4,'Great with logistics, kept us all fed too somehow.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000014',null,null,4,'Grace''s ML tweaks made a real difference to the clue accuracy.'),
('a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000002',null,null,4,'Nabila''s the reason we had props ready on time, underrated contribution.'),
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000014',null,null,5,'Grace''s model tuning at that hour was genuinely impressive.'),
('a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000006',null,null,5,'Jun Hao carried the technical side of this build, real MVP.'),
-- prior team: Ryan, Devi, Marcus, Ben
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000003',null,null,5,'Devi cleaned three years of messy spreadsheets without a single complaint.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000011',null,null,5,'Ryan led this really thoughtfully given it was for a real nonprofit, not a grade.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000007',null,null,5,'Marcus made charts that a nonprofit board actually understood, rare skill.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000011',null,null,4,'Good lead, kept the scope realistic for a weekend build.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000015',null,null,4,'Ben''s chart polish for the board presentation was well done.'),
('a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000011',null,null,5,'Ryan''s the reason a real nonprofit is still using our tool months later.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000007',null,null,5,'Marcus''s visual design work turned a boring dataset into something people wanted to look at.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000003',null,null,4,'Thorough with the data, made my job a lot easier.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000015',null,null,4,'Ben''s design eye elevated the whole dashboard.'),
('a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000003',null,null,4,'Devi''s data cleaning was thorough and well documented.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000015',null,null,5,'Ben and I clicked on the visual direction immediately, great collaborator.'),
('a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000007',null,null,5,'Marcus''s design instincts made this the best-looking thing I''ve shipped.'),
-- prior team: Farhana, Kai Zhi, Aisyah
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000004',null,null,5,'Kai Zhi''s AWS setup was flawless, first time I''ve deployed something without a 2am panic.'),
('a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000008',null,null,5,'Farhana led this from a side-project into something people actually use, great vision.'),
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000012',null,null,4,'Aisyah caught bugs across three browsers so nobody else had to.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000008',null,null,5,'Farhana''s design sense is why this actually looks like a real product.'),
('a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000012',null,null,4,'Aisyah''s QA work was thorough, caught things I definitely missed.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000004',null,null,4,'Kai Zhi''s cloud setup made this so much less painful than expected.');

-- ------------------------------------------------------------
-- 10) Join requests — a few pending on the new groups, so Applicants /
--     Teams·Requested aren't empty either. All against groups that are
--     NOT the requester's own group.
-- ------------------------------------------------------------
insert into public.join_requests (group_id, user_id, status, note, comment, decline_reason, declined_at) values
('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000008','pending', 'I''ve got some PyTorch experience from a DAI module, would love to help on the model side.', 'I''ve got some PyTorch experience from a DAI module, would love to help on the model side.', null, null),
('c0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000015','pending', null, null, null, null),
('c0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000006','pending', 'Interested in the data side, have SQL experience.', 'Interested in the data side, have SQL experience.', null, null),
('c0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000012','declined', null, null, 'Looking for someone with hands-on hardware/embedded experience specifically for this one.', now() - interval '1 day');

-- ------------------------------------------------------------
-- 11) Saved projects.
-- ------------------------------------------------------------
insert into public.project_favorites (user_id, project_id) values
('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000006'),
('a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000003'),
('a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000010'),
('a0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000008'),
('a0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000004');

-- ============================================================
-- EXPANSION (doubling pass) — 15 more profiles (a...0016-0030),
-- 10 more projects (b...0011-0020), 20 more groups (c...0021-0040).
-- Deliberately NOT clones of the first batch: 10 new SUTD profiles add
-- a 3rd+4th person to every existing pillar (still EPD/ESD/CSD/DAI/ASD,
-- 4 each now), 5 new NUS profiles use 5 DIFFERENT majors than the
-- first batch (Statistics, Electrical Engineering, Economics,
-- Environmental Studies, Chemical Engineering — first batch was
-- Business Analytics/CS/IS/DSA/Industrial Design). New projects cover
-- domains the first 10 didn't touch at all: fintech, transport
-- prediction, wellness, game-dev tooling, hardware marketplace, IoT,
-- accessibility mapping, personal-finance-adjacent utility, career
-- prep — every one has its own real skills/interests/personality
-- profile, not a reshuffled copy of an existing project.
-- ============================================================

-- ------------------------------------------------------------
-- 2b) 15 more auth accounts. Same password: test1234.
-- ------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000016','authenticated','authenticated','rachel.tan@sutd.edu.sg',    crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rachel Tan","username":"rachel_tan"}',           now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000017','authenticated','authenticated','faris.rahman@sutd.edu.sg',  crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Faris Rahman","username":"faris_rahman"}',       now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000018','authenticated','authenticated','michelle.goh@sutd.edu.sg',  crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Michelle Goh","username":"michelle_goh"}',       now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000019','authenticated','authenticated','daniel.lee@sutd.edu.sg',    crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Daniel Lee","username":"daniel_lee"}',           now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000020','authenticated','authenticated','amirah.zulkifli@sutd.edu.sg',crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Amirah Zulkifli","username":"amirah_zulkifli"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000021','authenticated','authenticated','sean.ng@sutd.edu.sg',       crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sean Ng","username":"sean_ng"}',                 now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000022','authenticated','authenticated','huiling.tay@sutd.edu.sg',   crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hui Ling Tay","username":"huiling_tay"}',        now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000023','authenticated','authenticated','zhixuan.koh@sutd.edu.sg',   crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Zhi Xuan Koh","username":"zhixuan_koh"}',        now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000024','authenticated','authenticated','aisyah.bakar@sutd.edu.sg',  crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nur Aisyah Bakar","username":"aisyah_bakar"}',   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000025','authenticated','authenticated','ryan.teo@sutd.edu.sg',      crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ryan Teo","username":"ryan_teo"}',               now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000026','authenticated','authenticated','xinyi.chua@u.nus.edu',      crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Xin Yi Chua","username":"xinyi_chua"}',          now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000027','authenticated','authenticated','arjun.menon@u.nus.edu',     crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Arjun Menon","username":"arjun_menon"}',         now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000028','authenticated','authenticated','bryan.koh@u.nus.edu',       crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Bryan Koh","username":"bryan_koh"}',             now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000029','authenticated','authenticated','farah.adnan@u.nus.edu',     crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Farah Adnan","username":"farah_adnan"}',         now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000','a0000000-0000-0000-0000-000000000030','authenticated','authenticated','kevin.sim@u.nus.edu',       crypt('test1234', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kevin Sim","username":"kevin_sim"}',             now(), now(), '', '', '', '');

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email),
       'email', now(), now(), now()
from auth.users u
where u.id::text like 'a0000000-%' and right(u.id::text, 3)::int between 16 and 30;

-- ------------------------------------------------------------
-- 3b) Profiles — 2 more per SUTD pillar (now 4 each), 5 new NUS majors
--     (Statistics, EE, Economics, Environmental Studies, ChemE —
--     distinct from the first batch's NUS majors).
-- ------------------------------------------------------------
update public.profiles set
  university='SUTD', major='EPD', year='Y2', gender='Woman',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='West',
  skills=array['Product','Research','Figma'], interests=array['Robotics','Sustainability','Design'],
  avatar_url='https://randomuser.me/api/portraits/women/24.jpg',
  bio='EPD Y2, robotics club regular. If a motor''s making a weird noise I probably already know why.'
where id='a0000000-0000-0000-0000-000000000016';

update public.profiles set
  university='SUTD', major='EPD', year='Y4', gender='Man',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='South',
  skills=array['C++','Product','AWS'], interests=array['Robotics','AI & ML','Sustainability'],
  avatar_url='https://randomuser.me/api/portraits/men/61.jpg',
  bio='EPD senior, into drone control systems and the occasional 2am firmware crash.'
where id='a0000000-0000-0000-0000-000000000017';

update public.profiles set
  university='SUTD', major='ESD', year='Y2', gender='Woman',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='Central',
  skills=array['SQL','Research','Business'], interests=array['Sustainability','Data Science','Social Impact'],
  avatar_url='https://randomuser.me/api/portraits/women/38.jpg',
  bio='ESD Y2, into water systems and why Singapore''s drains are smarter than most people think.'
where id='a0000000-0000-0000-0000-000000000018';

update public.profiles set
  university='SUTD', major='ESD', year='Y3', gender='Man',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='East',
  skills=array['Python','SQL','Research'], interests=array['Sustainability','Data Science','EdTech'],
  avatar_url='https://randomuser.me/api/portraits/men/29.jpg',
  bio='ESD Y3. Supply chains are basically puzzles with real consequences, which is why I like them.'
where id='a0000000-0000-0000-0000-000000000019';

update public.profiles set
  university='SUTD', major='CSD', year='Y2', gender='Woman',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='North',
  skills=array['Python','TypeScript','Docker'], interests=array['Web Dev','AI & ML','Data Science'],
  avatar_url='https://randomuser.me/api/portraits/women/47.jpg',
  bio='CSD Y2, backend person. Happiest when a service finally stops throwing 500s.'
where id='a0000000-0000-0000-0000-000000000020';

update public.profiles set
  university='SUTD', major='CSD', year='Y4', gender='Man',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='West',
  skills=array['Java','React','Node.js'], interests=array['Web Dev','EdTech','AI & ML'],
  avatar_url='https://randomuser.me/api/portraits/men/71.jpg',
  bio='CSD senior, full-stack by necessity. Will ship a side project instead of sleeping.'
where id='a0000000-0000-0000-0000-000000000021';

update public.profiles set
  university='SUTD', major='DAI', year='Y3', gender='Woman',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='Central',
  skills=array['Figma','UI/UX','Research'], interests=array['Design','EdTech','Social Impact'],
  avatar_url='https://randomuser.me/api/portraits/women/55.jpg',
  bio='DAI Y3, UX researcher at heart. I will ask you five follow-up questions about your onboarding flow.'
where id='a0000000-0000-0000-0000-000000000022';

update public.profiles set
  university='SUTD', major='DAI', year='Y1', gender='Man',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='South',
  skills=array['Python','PyTorch','Figma'], interests=array['AI & ML','Design','Data Science'],
  avatar_url='https://randomuser.me/api/portraits/men/18.jpg',
  bio='DAI freshman, obsessed with generative design. My GPU fan is basically a pet at this point.'
where id='a0000000-0000-0000-0000-000000000023';

update public.profiles set
  university='SUTD', major='ASD', year='Y2', gender='Woman',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='West',
  skills=array['Figma','Design','Research'], interests=array['Sustainability','Design','Social Impact'],
  avatar_url='https://randomuser.me/api/portraits/women/63.jpg',
  bio='ASD Y2, mapping campus heat islands one shaded bench at a time.'
where id='a0000000-0000-0000-0000-000000000024';

update public.profiles set
  university='SUTD', major='ASD', year='Y4', gender='Man',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='North',
  skills=array['Research','AWS','Figma'], interests=array['Sustainability','Robotics','Design'],
  avatar_url='https://randomuser.me/api/portraits/men/90.jpg',
  bio='ASD senior, parametric facades and the occasional Grasshopper script that actually works first try.'
where id='a0000000-0000-0000-0000-000000000025';

update public.profiles set
  university='NUS', major='Statistics', year='Y3', gender='Woman',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='Central',
  skills=array['SQL','TensorFlow','Business'], interests=array['Data Science','AI & ML','Healthcare'],
  avatar_url='https://randomuser.me/api/portraits/women/44.jpg',
  bio='Statistics Y3. If your p-value story doesn''t hold up I will find out.'
where id='a0000000-0000-0000-0000-000000000026';

update public.profiles set
  university='NUS', major='Electrical Engineering', year='Y2', gender='Man',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='South',
  skills=array['Python','C++','Product'], interests=array['Robotics','AI & ML','Sustainability'],
  avatar_url='https://randomuser.me/api/portraits/men/37.jpg',
  bio='EE Y2, into robotics and control systems. Half my notes are just circuit diagrams.'
where id='a0000000-0000-0000-0000-000000000027';

update public.profiles set
  university='NUS', major='Economics', year='Y4', gender='Man',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='North',
  skills=array['SQL','Business','Research'], interests=array['Data Science','Social Impact','EdTech'],
  avatar_url='https://randomuser.me/api/portraits/men/64.jpg',
  bio='Economics senior, spreadsheet enthusiast, mildly obsessed with market-design papers.'
where id='a0000000-0000-0000-0000-000000000028';

update public.profiles set
  university='NUS', major='Environmental Studies', year='Y1', gender='Woman',
  personality='Extrovert', prefer_working='Face-to-face', best_work_time='In the day time', location='East',
  skills=array['Research','SQL','Figma'], interests=array['Sustainability','Social Impact','Data Science'],
  avatar_url='https://randomuser.me/api/portraits/women/29.jpg',
  bio='Environmental Studies Y1, still new here but already annoyingly passionate about recycling bins.'
where id='a0000000-0000-0000-0000-000000000029';

update public.profiles set
  university='NUS', major='Chemical Engineering', year='Y3', gender='Man',
  personality='Introvert', prefer_working='Online', best_work_time='At night', location='Central',
  skills=array['Python','Research','AWS'], interests=array['Sustainability','Data Science','Robotics'],
  avatar_url='https://randomuser.me/api/portraits/men/58.jpg',
  bio='ChemE Y3. Process optimisation by day, occasional sustainability rabbit hole by night.'
where id='a0000000-0000-0000-0000-000000000030';

-- ------------------------------------------------------------
-- 4b) Per-skill proficiency for the 15 new profiles.
-- ------------------------------------------------------------
insert into public.user_skills (user_id, skill_name, proficiency) values
  ('a0000000-0000-0000-0000-000000000016','Product','Good'), ('a0000000-0000-0000-0000-000000000016','Research','Basic'), ('a0000000-0000-0000-0000-000000000016','Figma','Basic'),
  ('a0000000-0000-0000-0000-000000000017','C++','Expert'), ('a0000000-0000-0000-0000-000000000017','Product','Good'), ('a0000000-0000-0000-0000-000000000017','AWS','Basic'),
  ('a0000000-0000-0000-0000-000000000018','SQL','Good'), ('a0000000-0000-0000-0000-000000000018','Research','Good'), ('a0000000-0000-0000-0000-000000000018','Business','Basic'),
  ('a0000000-0000-0000-0000-000000000019','Python','Good'), ('a0000000-0000-0000-0000-000000000019','SQL','Expert'), ('a0000000-0000-0000-0000-000000000019','Research','Good'),
  ('a0000000-0000-0000-0000-000000000020','Python','Expert'), ('a0000000-0000-0000-0000-000000000020','TypeScript','Good'), ('a0000000-0000-0000-0000-000000000020','Docker','Good'),
  ('a0000000-0000-0000-0000-000000000021','Java','Good'), ('a0000000-0000-0000-0000-000000000021','React','Expert'), ('a0000000-0000-0000-0000-000000000021','Node.js','Good'),
  ('a0000000-0000-0000-0000-000000000022','Figma','Expert'), ('a0000000-0000-0000-0000-000000000022','UI/UX','Expert'), ('a0000000-0000-0000-0000-000000000022','Research','Basic'),
  ('a0000000-0000-0000-0000-000000000023','Python','Basic'), ('a0000000-0000-0000-0000-000000000023','PyTorch','Basic'), ('a0000000-0000-0000-0000-000000000023','Figma','Basic'),
  ('a0000000-0000-0000-0000-000000000024','Figma','Good'), ('a0000000-0000-0000-0000-000000000024','Design','Good'), ('a0000000-0000-0000-0000-000000000024','Research','Basic'),
  ('a0000000-0000-0000-0000-000000000025','Research','Expert'), ('a0000000-0000-0000-0000-000000000025','AWS','Basic'), ('a0000000-0000-0000-0000-000000000025','Figma','Good'),
  ('a0000000-0000-0000-0000-000000000026','SQL','Expert'), ('a0000000-0000-0000-0000-000000000026','TensorFlow','Good'), ('a0000000-0000-0000-0000-000000000026','Business','Basic'),
  ('a0000000-0000-0000-0000-000000000027','Python','Good'), ('a0000000-0000-0000-0000-000000000027','C++','Good'), ('a0000000-0000-0000-0000-000000000027','Product','Basic'),
  ('a0000000-0000-0000-0000-000000000028','SQL','Good'), ('a0000000-0000-0000-0000-000000000028','Business','Expert'), ('a0000000-0000-0000-0000-000000000028','Research','Good'),
  ('a0000000-0000-0000-0000-000000000029','Research','Basic'), ('a0000000-0000-0000-0000-000000000029','SQL','Basic'), ('a0000000-0000-0000-0000-000000000029','Figma','Basic'),
  ('a0000000-0000-0000-0000-000000000030','Python','Good'), ('a0000000-0000-0000-0000-000000000030','Research','Good'), ('a0000000-0000-0000-0000-000000000030','AWS','Basic');

-- ------------------------------------------------------------
-- 5b) 10 more projects — domains the first 10 didn't cover at all:
--     fintech, transport prediction, wellness, game-dev tooling,
--     hardware marketplace, IoT, accessibility, chore-splitting
--     utility, career-prep AI.
-- ------------------------------------------------------------
insert into public.projects (id, owner_id, name, description, type, skills_needed, interests, min_size, max_size, timeline_start, timeline_end, privacy, joining_method, project_link, allow_multiple_groups, course_code, instructor, things_to_note, cover_image_url, photo_url, join_code) values

('b0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000028','FinLit Quest',
 'A gamified budgeting app that turns "don''t blow your allowance" into a level-up system instead of a lecture, aimed at first-years who''ve never had to budget for themselves before.',
 'personal', array['React','SQL','Business'], array['EdTech','Social Impact'], 4, 8, '2026-09-03','2026-12-12',
 'public','approval', null, true, null, null,
 'Two tracks: the app itself, and the actual content/curriculum behind the lessons.',
 'https://picsum.photos/seed/finlitquest/800/400','https://picsum.photos/seed/finlitquest-sq/300/300','GRV-FINL3'),

('b0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000019','TransitPulse',
 'Predicts how crowded the campus shuttle and nearby MRT platforms will be 10 minutes out, using historical tap-in patterns instead of just a live map that only shows what''s already happened.',
 'academic', array['Python','SQL','AWS'], array['Data Science','Sustainability'], 4, 8, '2026-09-08','2026-12-17',
 'public','approval', null, true, '40.016 Fundamentals of Transportation Systems', 'Prof. Lynette Cheah',
 'Data pipeline group and rider-facing app group, meet weekly to sync.',
 'https://picsum.photos/seed/transitpulse/800/400','https://picsum.photos/seed/transitpulse-sq/300/300','GRV-TRNS3'),

('b0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000022','MindfulMinutes',
 'A 3-minute guided break app for between lectures — breathing exercises and short stretches, not another meditation app that wants a 20-minute commitment nobody has.',
 'personal', array['Figma','UI/UX','JavaScript'], array['Healthcare','Design'], 4, 7, '2026-08-18','2026-12-08',
 'public','approval', null, true, null, null,
 'Content group scripts the exercises, dev group builds the actual app.',
 'https://picsum.photos/seed/mindfulminutes/800/400','https://picsum.photos/seed/mindfulminutes-sq/300/300','GRV-MIND3'),

('b0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000021','GameJam Toolkit',
 'A shared library of pre-built prefabs, UI kits and sound assets so student game-jam teams stop rebuilding the same inventory system from scratch every single jam.',
 'personal', array['TypeScript','JavaScript','Design'], array['Web Dev','EdTech'], 4, 9, '2026-08-22','2026-12-11',
 'public','approval', 'https://github.com/example/gamejamtoolkit', true, null, null,
 'Engine-agnostic where possible, but most current assets target a web-based stack.',
 'https://picsum.photos/seed/gamejamtoolkit/800/400','https://picsum.photos/seed/gamejamtoolkit-sq/300/300','GRV-GAME3'),

('b0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000017','CircuitSwap',
 'A peer marketplace for used Arduino boards, sensors and leftover project parts, so half-finished componentry stops sitting in drawers after every module ends.',
 'personal', array['Product','React','Research'], array['Sustainability','Web Dev'], 4, 8, '2026-09-01','2026-12-20',
 'public','approval', null, true, null, null,
 'Marketplace/dev side and a smaller research group looking at campus e-waste data.',
 'https://picsum.photos/seed/circuitswap/800/400','https://picsum.photos/seed/circuitswap-sq/300/300','GRV-CIRC3'),

('b0000000-0000-0000-0000-000000000016','a0000000-0000-0000-0000-000000000020','VoiceNotes AI',
 'Turns raw lecture audio into structured, searchable notes instead of one giant wall of transcript text — still tuning how it handles professors who talk very, very fast.',
 'academic', array['Python','AI/ML','Docker'], array['AI & ML','EdTech'], 4, 8, '2026-09-05','2026-12-14',
 'public','approval', null, true, '50.021 Artificial Intelligence', 'Prof. Kian Hsiang Low',
 'Model group handles transcription/summarisation, product group handles the note-taking UI.',
 'https://picsum.photos/seed/voicenotesai/800/400','https://picsum.photos/seed/voicenotesai-sq/300/300','GRV-VOIC3'),

('b0000000-0000-0000-0000-000000000017','a0000000-0000-0000-0000-000000000016','UrbanFarm Sensors',
 'IoT soil-moisture and light sensors for the rooftop community garden, so watering happens on an actual schedule instead of whoever remembers first.',
 'academic', array['C++','Product','Research'], array['Sustainability','Robotics'], 4, 9, '2026-09-12','2026-12-19',
 'public','approval', null, true, '02.009 Design and Build for a Sustainable World', 'Prof. Lin Wei',
 'Hardware group builds/deploys sensors, software group builds the dashboard.',
 'https://picsum.photos/seed/urbanfarmsensors/800/400','https://picsum.photos/seed/urbanfarmsensors-sq/300/300','GRV-FARM3'),

('b0000000-0000-0000-0000-000000000018','a0000000-0000-0000-0000-000000000024','AccessMap',
 'Crowdsourced wheelchair-accessibility mapping of campus — ramps, lifts, the doors that are technically automatic but never actually open in time.',
 'personal', array['Figma','Research','JavaScript'], array['Social Impact','Design'], 4, 8, '2026-08-10','2026-12-05',
 'public','approval', null, true, null, null,
 'Field survey group walks the campus, dev group builds the map itself.',
 'https://picsum.photos/seed/accessmap/800/400','https://picsum.photos/seed/accessmap-sq/300/300','GRV-ACCS3'),

('b0000000-0000-0000-0000-000000000019','a0000000-0000-0000-0000-000000000026','ChoreSplit',
 'A fair chore-and-expense splitter for shared student housing, because "we''ll figure it out" never actually works once four people are involved.',
 'personal', array['React','SQL','Node.js'], array['Web Dev','Social Impact'], 4, 7, '2026-08-28','2026-12-09',
 'public','auto', 'https://choresplit.example.com', true, null, null,
 'Auto-accept — just come with an opinion about chore fairness.',
 'https://picsum.photos/seed/choresplit/800/400','https://picsum.photos/seed/choresplit-sq/300/300','GRV-CHOR3'),

('b0000000-0000-0000-0000-000000000020','a0000000-0000-0000-0000-000000000023','PitchPrep',
 'An AI mock-interview and pitch-practice partner for case comps and startup pitches, giving structured feedback instead of just a recording you never rewatch.',
 'academic', array['Python','AI/ML','Figma'], array['AI & ML','EdTech'], 4, 8, '2026-09-15','2026-12-22',
 'public','approval', null, true, '01.117 Communication for Engineers', 'Prof. Natalie Yeo',
 'Model/feedback-logic group and the practice-UI group, weekly joint demo.',
 'https://picsum.photos/seed/pitchprep/800/400','https://picsum.photos/seed/pitchprep-sq/300/300','GRV-PTCH3');

-- ------------------------------------------------------------
-- 6b) 20 more groups (2 per new project), same "different vibe from
--     its sibling" pattern as the first batch.
-- ------------------------------------------------------------
insert into public.groups (id, project_id, name, leader_id, recruiting, status, min_members, max_members, members_wanted, skills_wanted, personality_wanted, interests_wanted, joining_method, additional_notes) values

('c0000000-0000-0000-0000-000000000021','b0000000-0000-0000-0000-000000000011','FinLit Core','a0000000-0000-0000-0000-000000000028', true,'Forming',2,4,2,array['SQL','Business'],array['Introvert','Online','Night owl'],array['Social Impact'],'approval','Numbers and mechanics side, async, fast iteration.'),
('c0000000-0000-0000-0000-000000000022','b0000000-0000-0000-0000-000000000011','FinLit Outreach','a0000000-0000-0000-0000-000000000018', true,'Forming',2,5,3,array['Business','Research'],array['Extrovert','Face-to-face','Morning'],array['EdTech'],'approval','Curriculum and outreach side, daytime, beginner-friendly.'),

('c0000000-0000-0000-0000-000000000023','b0000000-0000-0000-0000-000000000012','Transit Data','a0000000-0000-0000-0000-000000000019', true,'Forming',2,4,2,array['Python','AWS'],array['Introvert','Online','Night owl'],array['Data Science'],'approval','Model/pipeline side, async, comfortable with real data mess.'),
('c0000000-0000-0000-0000-000000000024','b0000000-0000-0000-0000-000000000012','Transit Riders','a0000000-0000-0000-0000-000000000021', true,'Forming',2,5,3,array['React','SQL'],array['Extrovert','Face-to-face','Morning'],array['Sustainability'],'approval','Rider-facing app side, daytime, beginner-friendly.'),

('c0000000-0000-0000-0000-000000000025','b0000000-0000-0000-0000-000000000013','Mindful Core','a0000000-0000-0000-0000-000000000022', true,'Forming',2,4,2,array['Figma','UI/UX'],array['Introvert','Online','Night owl'],array['Healthcare'],'approval','App-build side, deep-focus async work.'),
('c0000000-0000-0000-0000-000000000026','b0000000-0000-0000-0000-000000000013','Mindful Outreach','a0000000-0000-0000-0000-000000000024', true,'Forming',2,5,3,array['Figma','Research'],array['Extrovert','Face-to-face','Morning'],array['Design'],'approval','Content/exercise-scripting side, daytime, no wellness background needed.'),

('c0000000-0000-0000-0000-000000000027','b0000000-0000-0000-0000-000000000014','Toolkit Engine','a0000000-0000-0000-0000-000000000021', true,'Forming',2,4,2,array['TypeScript','JavaScript'],array['Introvert','Online','Night owl'],array['Web Dev'],'approval','Core engine/tooling, async, comfortable with TS.'),
('c0000000-0000-0000-0000-000000000028','b0000000-0000-0000-0000-000000000014','Toolkit Assets','a0000000-0000-0000-0000-000000000023', true,'Forming',2,6,4,array['Design','Figma'],array['Extrovert','Face-to-face','Morning'],array['EdTech'],'approval','Asset/art side, casual pace, good for a first game-adjacent project.'),

('c0000000-0000-0000-0000-000000000029','b0000000-0000-0000-0000-000000000015','Circuit Marketplace','a0000000-0000-0000-0000-000000000017', true,'Forming',2,4,2,array['Product','React'],array['Introvert','Online','Night owl'],array['Sustainability'],'approval','Marketplace build, async, fast-moving.'),
('c0000000-0000-0000-0000-000000000030','b0000000-0000-0000-0000-000000000015','Circuit Research','a0000000-0000-0000-0000-000000000027', true,'Forming',2,5,3,array['Research','C++'],array['Extrovert','Face-to-face','Morning'],array['Web Dev'],'approval','E-waste data side, casual pace, good for first-timers.'),

('c0000000-0000-0000-0000-000000000031','b0000000-0000-0000-0000-000000000016','VoiceNotes Model','a0000000-0000-0000-0000-000000000020', true,'Forming',2,4,2,array['Python','AI/ML'],array['Introvert','Online','Night owl'],array['AI & ML'],'approval','Transcription/summarisation model side, async, ML background useful.'),
('c0000000-0000-0000-0000-000000000032','b0000000-0000-0000-0000-000000000016','VoiceNotes Product','a0000000-0000-0000-0000-000000000025', true,'Forming',2,5,3,array['Figma','Docker'],array['Extrovert','Face-to-face','Morning'],array['EdTech'],'approval','Note-taking UI side, daytime, beginner-friendly.'),

('c0000000-0000-0000-0000-000000000033','b0000000-0000-0000-0000-000000000017','UrbanFarm Hardware','a0000000-0000-0000-0000-000000000016', true,'Forming',2,4,2,array['C++','Product'],array['Introvert','Online','Night owl'],array['Robotics'],'approval','Sensor build/deploy, hands-on hardware work.'),
('c0000000-0000-0000-0000-000000000034','b0000000-0000-0000-0000-000000000017','UrbanFarm Software','a0000000-0000-0000-0000-000000000029', true,'Forming',2,5,3,array['Research','SQL'],array['Extrovert','Face-to-face','Morning'],array['Sustainability'],'approval','Dashboard/data side, casual pace, good for first-timers.'),

('c0000000-0000-0000-0000-000000000035','b0000000-0000-0000-0000-000000000018','AccessMap Field','a0000000-0000-0000-0000-000000000024', true,'Forming',2,4,2,array['Research','Figma'],array['Introvert','Online','Night owl'],array['Social Impact'],'approval','Survey/data side, async write-ups between site visits.'),
('c0000000-0000-0000-0000-000000000036','b0000000-0000-0000-0000-000000000018','AccessMap Dev','a0000000-0000-0000-0000-000000000030', true,'Forming',2,5,3,array['JavaScript','Figma'],array['Extrovert','Face-to-face','Morning'],array['Design'],'approval','Map-app build, daytime, beginner-friendly.'),

('c0000000-0000-0000-0000-000000000037','b0000000-0000-0000-0000-000000000019','ChoreSplit Core','a0000000-0000-0000-0000-000000000026', true,'Forming',2,4,2,array['React','Node.js'],array['Introvert','Online','Night owl'],array['Web Dev'],'auto','Auto-accept, core app build, async.'),
('c0000000-0000-0000-0000-000000000038','b0000000-0000-0000-0000-000000000019','ChoreSplit Feedback','a0000000-0000-0000-0000-000000000028', true,'Forming',2,5,3,array['Business','SQL'],array['Extrovert','Face-to-face','Morning'],array['Social Impact'],'auto','Auto-accept, user feedback/testing side, daytime.'),

('c0000000-0000-0000-0000-000000000039','b0000000-0000-0000-0000-000000000020','PitchPrep Model','a0000000-0000-0000-0000-000000000023', true,'Forming',2,4,2,array['Python','AI/ML'],array['Introvert','Online','Night owl'],array['AI & ML'],'approval','Feedback-logic side, async, ML background useful.'),
('c0000000-0000-0000-0000-000000000040','b0000000-0000-0000-0000-000000000020','PitchPrep Practice','a0000000-0000-0000-0000-000000000018', true,'Forming',2,5,3,array['Figma','Business'],array['Extrovert','Face-to-face','Morning'],array['EdTech'],'approval','Practice-UI side, daytime, beginner-friendly.');

-- ------------------------------------------------------------
-- 7b) Group membership for the 20 new groups — leader + 1 real member
--     each, deliberately reusing some people across projects (same
--     cross-leadership pattern the first batch already established,
--     e.g. one person legitimately leads/joins groups on unrelated
--     projects — allowed, only a 2nd group on the SAME project is
--     blocked server-side).
-- ------------------------------------------------------------
insert into public.group_members (group_id, user_id, role) values
('c0000000-0000-0000-0000-000000000021','a0000000-0000-0000-0000-000000000028','leader'), ('c0000000-0000-0000-0000-000000000021','a0000000-0000-0000-0000-000000000019','member'),
('c0000000-0000-0000-0000-000000000022','a0000000-0000-0000-0000-000000000018','leader'), ('c0000000-0000-0000-0000-000000000022','a0000000-0000-0000-0000-000000000029','member'),
('c0000000-0000-0000-0000-000000000023','a0000000-0000-0000-0000-000000000019','leader'), ('c0000000-0000-0000-0000-000000000023','a0000000-0000-0000-0000-000000000027','member'),
('c0000000-0000-0000-0000-000000000024','a0000000-0000-0000-0000-000000000021','leader'), ('c0000000-0000-0000-0000-000000000024','a0000000-0000-0000-0000-000000000016','member'),
('c0000000-0000-0000-0000-000000000025','a0000000-0000-0000-0000-000000000022','leader'), ('c0000000-0000-0000-0000-000000000025','a0000000-0000-0000-0000-000000000024','member'),
('c0000000-0000-0000-0000-000000000026','a0000000-0000-0000-0000-000000000024','leader'), ('c0000000-0000-0000-0000-000000000026','a0000000-0000-0000-0000-000000000022','member'),
('c0000000-0000-0000-0000-000000000027','a0000000-0000-0000-0000-000000000021','leader'), ('c0000000-0000-0000-0000-000000000027','a0000000-0000-0000-0000-000000000020','member'),
('c0000000-0000-0000-0000-000000000028','a0000000-0000-0000-0000-000000000023','leader'), ('c0000000-0000-0000-0000-000000000028','a0000000-0000-0000-0000-000000000017','member'),
('c0000000-0000-0000-0000-000000000029','a0000000-0000-0000-0000-000000000017','leader'), ('c0000000-0000-0000-0000-000000000029','a0000000-0000-0000-0000-000000000030','member'),
('c0000000-0000-0000-0000-000000000030','a0000000-0000-0000-0000-000000000027','leader'), ('c0000000-0000-0000-0000-000000000030','a0000000-0000-0000-0000-000000000026','member'),
('c0000000-0000-0000-0000-000000000031','a0000000-0000-0000-0000-000000000020','leader'), ('c0000000-0000-0000-0000-000000000031','a0000000-0000-0000-0000-000000000023','member'),
('c0000000-0000-0000-0000-000000000032','a0000000-0000-0000-0000-000000000025','leader'), ('c0000000-0000-0000-0000-000000000032','a0000000-0000-0000-0000-000000000016','member'),
('c0000000-0000-0000-0000-000000000033','a0000000-0000-0000-0000-000000000016','leader'), ('c0000000-0000-0000-0000-000000000033','a0000000-0000-0000-0000-000000000017','member'),
('c0000000-0000-0000-0000-000000000034','a0000000-0000-0000-0000-000000000029','leader'), ('c0000000-0000-0000-0000-000000000034','a0000000-0000-0000-0000-000000000019','member'),
('c0000000-0000-0000-0000-000000000035','a0000000-0000-0000-0000-000000000024','leader'), ('c0000000-0000-0000-0000-000000000035','a0000000-0000-0000-0000-000000000021','member'),
('c0000000-0000-0000-0000-000000000036','a0000000-0000-0000-0000-000000000030','leader'), ('c0000000-0000-0000-0000-000000000036','a0000000-0000-0000-0000-000000000022','member'),
('c0000000-0000-0000-0000-000000000037','a0000000-0000-0000-0000-000000000026','leader'), ('c0000000-0000-0000-0000-000000000037','a0000000-0000-0000-0000-000000000028','member'),
('c0000000-0000-0000-0000-000000000038','a0000000-0000-0000-0000-000000000028','leader'), ('c0000000-0000-0000-0000-000000000038','a0000000-0000-0000-0000-000000000018','member'),
('c0000000-0000-0000-0000-000000000039','a0000000-0000-0000-0000-000000000023','leader'), ('c0000000-0000-0000-0000-000000000039','a0000000-0000-0000-0000-000000000025','member'),
('c0000000-0000-0000-0000-000000000040','a0000000-0000-0000-0000-000000000018','leader'), ('c0000000-0000-0000-0000-000000000040','a0000000-0000-0000-0000-000000000027','member');

-- (project_members backfill in section 7 above is a dynamic SELECT over
-- whatever's in group_members/projects, so it already picks up all of
-- this new batch too — nothing to add here.)

-- ------------------------------------------------------------
-- 8b) Past projects for the 15 new profiles, 2 each, freestanding
--     (same reasoning as section 8: none of the 20 current projects
--     are "past" ones for these to link to).
-- ------------------------------------------------------------
insert into public.past_projects (user_id, project_id, role, write_up) values
('a0000000-0000-0000-0000-000000000016',null,'Hardware Lead','Built the actuator rig for a robotics-club demo bot, spent more time on cable management than the actual code.'),
('a0000000-0000-0000-0000-000000000016',null,'Prototyping','Helped a senior''s capstone project survive its 3am pre-demo motor failure.'),
('a0000000-0000-0000-0000-000000000017',null,'Firmware','Wrote the flight-stabilisation firmware for a coursework drone, only crashed it twice during testing.'),
('a0000000-0000-0000-0000-000000000017',null,'Team Lead','Led a mini quadcopter build for an EPD elective, budget was tighter than the frame tolerances.'),
('a0000000-0000-0000-0000-000000000018',null,'Research','Modelled stormwater runoff for a class project, learned way more about Singapore''s drains than expected.'),
('a0000000-0000-0000-0000-000000000018',null,'Data Analysis','Analysed campus water-usage data for an ESD assignment, found some genuinely surprising patterns.'),
('a0000000-0000-0000-0000-000000000019',null,'Systems Analyst','Mapped a mock supply chain for a logistics case competition, we placed top 3.'),
('a0000000-0000-0000-0000-000000000019',null,'Team Lead','Led a systems-thinking group project on food distribution, kept the model from getting too abstract.'),
('a0000000-0000-0000-0000-000000000020',null,'Backend','Built the API layer for a CSD module project, first time deploying something that didn''t fall over under load.'),
('a0000000-0000-0000-0000-000000000020',null,'Infra','Containerised a classmate''s messy Flask app so it finally ran the same way twice.'),
('a0000000-0000-0000-0000-000000000021',null,'Full-stack','Shipped a small events app for a CSD elective, still gets the occasional random signup.'),
('a0000000-0000-0000-0000-000000000021',null,'Team Lead','Led a 48-hour internal hackathon team, we didn''t win but the demo didn''t crash which felt like winning.'),
('a0000000-0000-0000-0000-000000000022',null,'UX Research','Ran usability tests for a DAI studio project, three participants got genuinely confused by the same button.'),
('a0000000-0000-0000-0000-000000000022',null,'Design Lead','Led the visual direction for a DAI group project on accessible signage.'),
('a0000000-0000-0000-0000-000000000023',null,'ML Support','Trained a tiny style-transfer model for a DAI elective, GPU fan never forgave me.'),
('a0000000-0000-0000-0000-000000000023',null,'Design','Built generative pattern variations for a first-year design brief.'),
('a0000000-0000-0000-0000-000000000024',null,'Fieldwork','Surveyed accessibility gaps across two ASD studio sites, the ramps were worse than expected.'),
('a0000000-0000-0000-0000-000000000024',null,'Design','Designed shaded-walkway concepts for an ASD urban-heat assignment.'),
('a0000000-0000-0000-0000-000000000025',null,'Parametric Design','Scripted a parametric facade for an ASD studio brief, Grasshopper and I are no longer on speaking terms.'),
('a0000000-0000-0000-0000-000000000025',null,'Team Lead','Led a small studio group through a housing-density brief, deadline was brutal.'),
('a0000000-0000-0000-0000-000000000026',null,'Statistical Analysis','Ran the regression models for a Statistics module project on survey bias, results were messier than expected.'),
('a0000000-0000-0000-0000-000000000026',null,'Data Cleaning','Cleaned a genuinely awful dataset for a healthcare-analytics case study.'),
('a0000000-0000-0000-0000-000000000027',null,'Control Systems','Built a PID controller for an EE lab project, tuned it more times than I''d like to admit.'),
('a0000000-0000-0000-0000-000000000027',null,'Hardware','Helped debug a robotics-club line-follower that kept veering left for no clear reason.'),
('a0000000-0000-0000-0000-000000000028',null,'Market Analysis','Wrote the market-design section of an Economics term paper, cited way too many auction-theory papers.'),
('a0000000-0000-0000-0000-000000000028',null,'Team Lead','Led a case-competition team on pricing strategy, we made the final round.'),
('a0000000-0000-0000-0000-000000000029',null,'Research','Surveyed campus recycling habits for an Environmental Studies module, results were more depressing than expected.'),
('a0000000-0000-0000-0000-000000000029',null,'Fieldwork','Helped audit a residence hall''s waste sorting for a sustainability assignment.'),
('a0000000-0000-0000-0000-000000000030',null,'Process Optimisation','Optimised a mock chemical process flow for a ChemE assignment, shaved a surprising amount off the simulated cost.'),
('a0000000-0000-0000-0000-000000000030',null,'Lab Support','Helped a labmate salvage a failed titration series with better error analysis.');

-- ------------------------------------------------------------
-- 9b) Ratings for the 15 new profiles — 3 prior-team clusters of 5
--     (16-20, 21-25, 26-30), same freestanding pattern as section 9.
-- ------------------------------------------------------------
insert into public.ratings (rater_id, ratee_id, project_id, group_id, stars, comment) values
-- prior team: Rachel, Faris, Michelle, Daniel, Amirah
('a0000000-0000-0000-0000-000000000016','a0000000-0000-0000-0000-000000000017',null,null,5,'Faris kept the drone from becoming a very expensive paperweight, great under pressure.'),
('a0000000-0000-0000-0000-000000000017','a0000000-0000-0000-0000-000000000016',null,null,5,'Rachel''s cable management alone saved our demo, seriously underrated skill.'),
('a0000000-0000-0000-0000-000000000017','a0000000-0000-0000-0000-000000000018',null,null,4,'Michelle''s stormwater model held up better than I expected going in.'),
('a0000000-0000-0000-0000-000000000018','a0000000-0000-0000-0000-000000000017',null,null,5,'Faris tuned the firmware fast, drone barely wobbled by the end.'),
('a0000000-0000-0000-0000-000000000018','a0000000-0000-0000-0000-000000000019',null,null,5,'Daniel kept the supply-chain case grounded, top 3 was well deserved.'),
('a0000000-0000-0000-0000-000000000019','a0000000-0000-0000-0000-000000000018',null,null,4,'Michelle''s water-usage analysis found things nobody else would''ve caught.'),
('a0000000-0000-0000-0000-000000000019','a0000000-0000-0000-0000-000000000020',null,null,5,'Amirah''s API didn''t fall over once, genuinely impressive for a first deploy.'),
('a0000000-0000-0000-0000-000000000020','a0000000-0000-0000-0000-000000000019',null,null,5,'Daniel''s systems-thinking lead kept our food-distribution model from spiralling into nonsense.'),
('a0000000-0000-0000-0000-000000000020','a0000000-0000-0000-0000-000000000016',null,null,4,'Rachel''s actuator rig was solid, made the demo look way more polished than it had any right to.'),
('a0000000-0000-0000-0000-000000000016','a0000000-0000-0000-0000-000000000020',null,null,5,'Amirah containerised my mess of a Flask app without complaint, lifesaver.'),
('a0000000-0000-0000-0000-000000000016','a0000000-0000-0000-0000-000000000019',null,null,4,'Daniel''s a careful thinker, good to have on a team when things get messy.'),
('a0000000-0000-0000-0000-000000000019','a0000000-0000-0000-0000-000000000016',null,null,5,'Rachel''s hands-on with hardware in a way that saved us real time.'),
('a0000000-0000-0000-0000-000000000017','a0000000-0000-0000-0000-000000000020',null,null,5,'Amirah''s infra work is quietly excellent, things just work.'),
('a0000000-0000-0000-0000-000000000020','a0000000-0000-0000-0000-000000000017',null,null,4,'Faris handles pressure well, drone crashes and all.'),
-- prior team: Sean, Hui Ling, Zhi Xuan, Aisyah, Ryan Teo
('a0000000-0000-0000-0000-000000000021','a0000000-0000-0000-0000-000000000022',null,null,5,'Hui Ling''s usability tests caught a confusing button literally everyone else missed.'),
('a0000000-0000-0000-0000-000000000022','a0000000-0000-0000-0000-000000000021',null,null,5,'Sean shipped that events app fast and it''s still somehow running.'),
('a0000000-0000-0000-0000-000000000022','a0000000-0000-0000-0000-000000000023',null,null,4,'Zhi Xuan''s generative patterns gave our brief way more range than expected.'),
('a0000000-0000-0000-0000-000000000023','a0000000-0000-0000-0000-000000000022',null,null,5,'Hui Ling''s design direction pulled a messy studio project together.'),
('a0000000-0000-0000-0000-000000000023','a0000000-0000-0000-0000-000000000024',null,null,5,'Aisyah''s accessibility survey findings were sobering but exactly what we needed.'),
('a0000000-0000-0000-0000-000000000024','a0000000-0000-0000-0000-000000000023',null,null,4,'Zhi Xuan''s style-transfer experiment was more polished than a "GPU fan never forgave me" project has any right to be.'),
('a0000000-0000-0000-0000-000000000024','a0000000-0000-0000-0000-000000000025',null,null,5,'Ryan''s facade script turned a vague brief into something genuinely buildable.'),
('a0000000-0000-0000-0000-000000000025','a0000000-0000-0000-0000-000000000024',null,null,5,'Aisyah''s shaded-walkway concepts were the strongest part of our urban-heat submission.'),
('a0000000-0000-0000-0000-000000000025','a0000000-0000-0000-0000-000000000021',null,null,4,'Sean''s hackathon team didn''t win but the demo running smoothly said a lot.'),
('a0000000-0000-0000-0000-000000000021','a0000000-0000-0000-0000-000000000025',null,null,5,'Ryan led our housing-density group through a brutal deadline without anyone melting down.'),
('a0000000-0000-0000-0000-000000000021','a0000000-0000-0000-0000-000000000023',null,null,4,'Zhi Xuan picks up new tools fast, good to have around under a tight brief.'),
('a0000000-0000-0000-0000-000000000023','a0000000-0000-0000-0000-000000000021',null,null,5,'Sean''s full-stack instincts saved our internal hackathon build.'),
('a0000000-0000-0000-0000-000000000022','a0000000-0000-0000-0000-000000000025',null,null,5,'Ryan''s parametric work is meticulous, even when Grasshopper clearly wasn''t cooperating.'),
('a0000000-0000-0000-0000-000000000025','a0000000-0000-0000-0000-000000000022',null,null,4,'Hui Ling''s research made our studio brief feel actually evidence-based, not just opinions.'),
-- prior team: Xin Yi, Arjun, Bryan, Farah, Kevin
('a0000000-0000-0000-0000-000000000026','a0000000-0000-0000-0000-000000000027',null,null,5,'Arjun''s PID tuning patience paid off, controller was rock solid by the end.'),
('a0000000-0000-0000-0000-000000000027','a0000000-0000-0000-0000-000000000026',null,null,4,'Xin Yi''s regression work held up to some tough questions from the module reviewer.'),
('a0000000-0000-0000-0000-000000000027','a0000000-0000-0000-0000-000000000028',null,null,5,'Bryan''s market-design section was the strongest part of our term paper, hands down.'),
('a0000000-0000-0000-0000-000000000028','a0000000-0000-0000-0000-000000000027',null,null,5,'Arjun debugged that line-follower faster than anyone else on the team would have.'),
('a0000000-0000-0000-0000-000000000028','a0000000-0000-0000-0000-000000000029',null,null,4,'Farah''s recycling survey results were genuinely eye-opening, more depressing than expected but useful.'),
('a0000000-0000-0000-0000-000000000029','a0000000-0000-0000-0000-000000000028',null,null,5,'Bryan led our pricing-strategy case team into the final round, sharp thinking under time pressure.'),
('a0000000-0000-0000-0000-000000000029','a0000000-0000-0000-0000-000000000030',null,null,5,'Kevin''s process optimisation shaved real cost off our simulated line, impressive for a mock assignment.'),
('a0000000-0000-0000-0000-000000000030','a0000000-0000-0000-0000-000000000029',null,null,4,'Farah''s waste-sorting audit was thorough, more useful data than I expected going in.'),
('a0000000-0000-0000-0000-000000000030','a0000000-0000-0000-0000-000000000026',null,null,5,'Xin Yi''s data cleaning turned an unusable healthcare dataset into something we could actually model.'),
('a0000000-0000-0000-0000-000000000026','a0000000-0000-0000-0000-000000000030',null,null,4,'Kevin''s lab error-analysis saved a titration series I''d already written off.'),
('a0000000-0000-0000-0000-000000000026','a0000000-0000-0000-0000-000000000029',null,null,4,'Farah''s fieldwork is careful and well-documented, good collaborator.'),
('a0000000-0000-0000-0000-000000000029','a0000000-0000-0000-0000-000000000026',null,null,5,'Xin Yi''s statistical instincts are sharp, caught a bias issue nobody else flagged.'),
('a0000000-0000-0000-0000-000000000027','a0000000-0000-0000-0000-000000000030',null,null,4,'Kevin''s optimisation work is thorough, good to have on a technical team.'),
('a0000000-0000-0000-0000-000000000030','a0000000-0000-0000-0000-000000000027',null,null,5,'Arjun''s control-systems debugging was fast and methodical.');

-- ------------------------------------------------------------
-- 10b) A few more join requests / saves so the new groups/projects
--      aren't completely empty of activity either.
-- ------------------------------------------------------------
insert into public.join_requests (group_id, user_id, status, note, comment, decline_reason, declined_at) values
('c0000000-0000-0000-0000-000000000023','a0000000-0000-0000-0000-000000000026','pending', 'Have SQL + stats background, happy to help with the data side.', 'Have SQL + stats background, happy to help with the data side.', null, null),
('c0000000-0000-0000-0000-000000000033','a0000000-0000-0000-0000-000000000027','pending', 'EE background, comfortable with sensor wiring.', 'EE background, comfortable with sensor wiring.', null, null),
('c0000000-0000-0000-0000-000000000040','a0000000-0000-0000-0000-000000000022','pending', null, null, null, null);

insert into public.project_favorites (user_id, project_id) values
('a0000000-0000-0000-0000-000000000016','b0000000-0000-0000-0000-000000000016'),
('a0000000-0000-0000-0000-000000000020','b0000000-0000-0000-0000-000000000017'),
('a0000000-0000-0000-0000-000000000028','b0000000-0000-0000-0000-000000000013');

-- ------------------------------------------------------------
-- Done. Verify:
--   select username, full_name, university, major from public.profiles order by university, major;
--   select name, type, privacy, join_code from public.projects order by name;
--   select p.name, count(g.id) as n_groups from public.projects p join public.groups g on g.project_id = p.id group by p.name;
--   select ratee_id, count(*), round(avg(stars),1) from public.ratings group by ratee_id order by 2;
--   select count(*) from public.profiles;  -- expect 30
--   select count(*) from public.projects;  -- expect 20
--   select count(*) from public.groups;    -- expect 40
-- ------------------------------------------------------------
