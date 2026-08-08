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

-- ------------------------------------------------------------
-- Done. Verify:
--   select username, full_name, university, major from public.profiles order by university, major;
--   select name, type, privacy, join_code from public.projects order by name;
--   select p.name, count(g.id) as n_groups from public.projects p join public.groups g on g.project_id = p.id group by p.name;
--   select ratee_id, count(*), round(avg(stars),1) from public.ratings group by ratee_id order by 2;
-- ------------------------------------------------------------
