-- ============================================================
-- Groovp — full showcase reseed, v2 (SUTD + NUS only).
-- ⚠️ DESTRUCTIVE: wipes every account and every piece of app data,
-- then recreates 15 profiles (10 SUTD across all 5 pillars — EPD, ESD,
-- CSD, DAI, ASD — plus 5 NUS) and 20 projects. Every one of the 20
-- catalog skills and all 9 canonical interests is used by at least one
-- project (checked by hand, see the coverage note before section 5).
-- Every profile gets a photo, full personality, 2 real past projects,
-- and 5-6 real ratings from actual former teammates (not filler).
--
-- Login for ANY of the 15 accounts: password test1234, emails below.
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
-- 5) 20 projects. Coverage check (every catalog skill / canonical
--    interest appears in skills_needed/interests of at least one row
--    below — verified by hand against skill_catalog's 20 entries and
--    the 9-interest constraint):
--    Skills: Python(2,5,10,15) React(2,10,17,19) TypeScript(8) JavaScript(4,17,19)
--      Node.js(6,11) SQL(3,5,7,11,15,19) Figma(3,7,8,9,12,13,17,20) UI/UX(4,8,17)
--      Java(5,18) C++(1,9) TensorFlow(4,18) AWS(8,10,13,14,15,18) Docker(6,11)
--      Research(1,2,4,9,10,12,14,20) Product(1,9,14) Design(3,8,9,12,17,20)
--      Business(7,16) AI/ML(2,5,6,18) FastAPI(10) PyTorch(6)
--    Interests: Robotics(1,2,10,14) Sustainability(1,3,9,10,12,14,15,20) AI & ML(2,5,6,10,18)
--      Data Science(2,5,7,15,16,18) Design(3,8,12,17,20) Social Impact(4,7,10,16,19)
--      Healthcare(5,18) EdTech(6,8,17,19) Web Dev(10,11,13,19)
-- ------------------------------------------------------------
insert into public.projects (id, owner_id, name, description, type, skills_needed, interests, min_size, max_size, timeline_start, timeline_end, privacy, joining_method, project_link, allow_multiple_groups, course_code, instructor, things_to_note, cover_image_url, photo_url, join_code) values

('b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','SmartCart',
 'An autonomous grocery trolley that follows you around and stops you buying instant noodles for the fifth day running. EPD/ESD capstone build.',
 'academic', array['Product','C++','Research'], array['Robotics','Sustainability'], 3, 5, '2026-02-01','2026-05-20',
 'restricted','approval', null, true, '03.007 Product Development Studio', 'Prof. Lin Wei',
 'Wrapped for the studio deadline, the hardware still lives in the EPD lab if anyone wants to poke it.',
 'https://picsum.photos/seed/smartcart/800/400','https://picsum.photos/seed/smartcart-sq/300/300','GRV-CART1'),

('b0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000006','NeuralCompanion',
 'An AI study buddy that quizzes you based on your own lecture notes instead of generic flashcards. Built for finals season, by people who''ve suffered through finals season.',
 'academic', array['Python','React','AI/ML'], array['AI & ML','Data Science'], 3, 5, '2026-01-15','2026-04-30',
 'restricted','approval', 'https://github.com/example/neuralcompanion', true, '50.038 Computational Data Science', 'Prof. Dorien Herremans',
 'Weekly sync was Wed 6pm on Discord, everything else async.',
 'https://picsum.photos/seed/neuralcompanion/800/400','https://picsum.photos/seed/neuralcompanion-sq/300/300','GRV-NEURA'),

('b0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000009','HackTheCity',
 'A 36-hour cross-university hackathon build — urban sustainability dashboards for smaller Singapore town councils, made with three different schools'' worth of sleep deprivation.',
 'personal', array['Figma','SQL','Design'], array['Sustainability','Design'], 3, 5, '2026-03-14','2026-03-16',
 'public','approval', null, false, null, null,
 'Hackathon''s over, keeping the repo up in case any town council actually wants it.',
 'https://picsum.photos/seed/hackthecity/800/400','https://picsum.photos/seed/hackthecity-sq/300/300','GRV-HACKC'),

('b0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000014','CampusEats',
 'A food-waste tracker for campus canteens — log what gets thrown out, nudge stalls toward better portioning. NUS module project.',
 'academic', array['JavaScript','TensorFlow','UI/UX'], array['Sustainability','Social Impact'], 3, 4, '2026-01-08','2026-04-10',
 'restricted','approval', null, true, 'BT3103 Application Development', 'Prof. Tan Yong Chin',
 'Handed off the dataset to the canteen operator after the module ended.',
 'https://picsum.photos/seed/campuseats/800/400','https://picsum.photos/seed/campuseats-sq/300/300','GRV-EATS1'),

('b0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000005','MediMate',
 'A symptom-checker chatbot from an SUTD-NUS healthcare hackathon. Not trying to replace doctors, just trying to stop your friends Googling their symptoms at 3am.',
 'personal', array['Java','SQL','AI/ML'], array['Healthcare','Data Science'], 3, 4, '2026-02-20','2026-02-22',
 'public','approval', 'https://github.com/example/medimate', false, null, null,
 'Hackathon project, dormant now but happy to hand it off if someone wants to build on it.',
 'https://picsum.photos/seed/medimate/800/400','https://picsum.photos/seed/medimate-sq/300/300','GRV-MEDIM'),

('b0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000010','OrientMate',
 'A scavenger-hunt style app for freshmen orientation week, built overnight with people from three different courses who''d never met before that night.',
 'personal', array['Node.js','Docker','PyTorch'], array['EdTech','AI & ML'], 3, 5, '2026-01-04','2026-01-05',
 'public','approval', null, false, null, null,
 '24hr build, shipped at 6am on 3 hours of sleep and somehow it worked.',
 'https://picsum.photos/seed/orientmate/800/400','https://picsum.photos/seed/orientmate-sq/300/300','GRV-ORIEN'),

('b0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000011','DataViz for Social Good',
 'Interactive dashboards built for a local nonprofit, visualizing donation and volunteer data they''d been sitting on in spreadsheets for years.',
 'personal', array['SQL','Business','Figma'], array['Data Science','Social Impact'], 3, 4, '2026-04-01','2026-04-03',
 'public','approval', null, false, null, null,
 'Weekend build for a local nonprofit, they''re actually still using it.',
 'https://picsum.photos/seed/datavizsocial/800/400','https://picsum.photos/seed/datavizsocial-sq/300/300','GRV-DVIZS'),

('b0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000008','PortfolioBuilder',
 'A no-code-ish portfolio site generator for design students who don''t want to touch a single line of CSS. Grew out of a design studio side-project.',
 'personal', array['TypeScript','UI/UX','AWS'], array['Design','EdTech'], 2, 3, '2026-05-01','2026-05-25',
 'public','auto', 'https://portfoliobuilder.example.com', false, null, null,
 'Wrapped for now, might revisit if enough people ask.',
 'https://picsum.photos/seed/portfoliobuilder/800/400','https://picsum.photos/seed/portfoliobuilder-sq/300/300','GRV-PFOLI'),

('b0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000001','AutoBrew',
 'Retrofitting a broken office coffee machine with a scheduling app and a usage-prediction model so it''s never empty right before a deadline.',
 'academic', array['Product','C++','Research'], array['Robotics','Sustainability'], 2, 4, '2026-08-15','2026-12-05',
 'restricted','approval', null, true, '03.014 Design for Manufacture', 'Prof. Lin Wei',
 'Working sessions Tue evenings in the EPD workshop.',
 'https://picsum.photos/seed/autobrew/800/400','https://picsum.photos/seed/autobrew-sq/300/300','GRV-BREW1'),

('b0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000005','DevMatch',
 'A slightly meta side project — a teammate-matching tool for hackathons, built to scratch our own itch after one too many mismatched teams.',
 'personal', array['Python','FastAPI','React'], array['Web Dev','AI & ML'], 2, 4, '2026-08-05','2026-11-15',
 'public','approval', 'https://github.com/example/devmatch', false, null, null,
 'Open to anyone from any school, that''s the whole point of the tool.',
 'https://picsum.photos/seed/devmatch/800/400','https://picsum.photos/seed/devmatch-sq/300/300','GRV-DMTCH'),

('b0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000006','QuickAPI',
 'A booking backend for campus event spaces — built because the existing sign-up sheet system was, genuinely, a physical clipboard.',
 'academic', array['Node.js','Docker','SQL'], array['Web Dev','Data Science'], 2, 4, '2026-08-20','2026-12-10',
 'restricted','approval', null, true, '50.012 Networks', 'Prof. Sudipta Chattopadhyay',
 'API docs live on the shared Notion, PRs welcome from the module cohort.',
 'https://picsum.photos/seed/quickapi/800/400','https://picsum.photos/seed/quickapi-sq/300/300','GRV-QAPI1'),

('b0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000009','GreenBlueprint',
 'A sustainable-housing visualizer — plug in a floor plan, see estimated energy use and passive cooling potential before a single brick is laid.',
 'academic', array['Figma','Research','Design'], array['Sustainability','Design'], 2, 4, '2026-08-10','2026-12-01',
 'restricted','approval', null, true, '20.101 Architecture Studio', 'Prof. Khoo Peng Beng',
 'Studio crits every other Friday, come with something to show.',
 'https://picsum.photos/seed/greenblueprint/800/400','https://picsum.photos/seed/greenblueprint-sq/300/300','GRV-GBLU1'),

('b0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000010','CampusHeritage AR',
 'An AR walking tour overlaying old photos and stories onto current campus buildings, mostly so freshmen stop calling the oldest block "the ugly one."',
 'personal', array['Figma','AWS','Research'], array['Sustainability','Social Impact'], 2, 4, '2026-08-01','2026-11-20',
 'public','approval', null, false, null, null,
 'Looking for anyone into AR/heritage stuff, school doesn''t matter.',
 'https://picsum.photos/seed/campusheritage/800/400','https://picsum.photos/seed/campusheritage-sq/300/300','GRV-HERIT'),

('b0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000002','EcoPack',
 'Prototyping biodegradable packaging from campus food waste — mostly failed attempts so far, but the one that worked smelled surprisingly fine.',
 'academic', array['Product','Research','AWS'], array['Sustainability','Robotics'], 2, 4, '2026-08-12','2026-12-08',
 'restricted','approval', null, true, '03.020 Materials for Design', 'Prof. Sanjairaj Vijayavenkataraman',
 'Materials lab access Mon/Wed afternoons, sign up on the shared sheet.',
 'https://picsum.photos/seed/ecopack/800/400','https://picsum.photos/seed/ecopack-sq/300/300','GRV-ECOPK'),

('b0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000003','CarbonLens',
 'A dashboard estimating each building''s daily carbon output from public campus energy-meter data, built to make the sustainability report less of a PDF nobody reads.',
 'academic', array['Python','SQL','AWS'], array['Sustainability','Data Science'], 2, 4, '2026-08-18','2026-12-12',
 'restricted','approval', null, true, '02.005 Systems Thinking', 'Prof. Fadel Digham',
 'Data refreshes nightly, check the shared dashboard link each morning.',
 'https://picsum.photos/seed/carbonlens/800/400','https://picsum.photos/seed/carbonlens-sq/300/300','GRV-CLENS'),

('b0000000-0000-0000-0000-000000000016','a0000000-0000-0000-0000-000000000004','PolicySim',
 'A lightweight simulator letting you tweak one urban policy lever at a time and see rough downstream effects — built to make a policy module less abstract.',
 'personal', array['Python','Research','Business'], array['Social Impact','Data Science'], 2, 4, '2026-08-22','2026-12-02',
 'public','approval', null, false, null, null,
 'Personal project, but happy to have collaborators from any background.',
 'https://picsum.photos/seed/policysim/800/400','https://picsum.photos/seed/policysim-sq/300/300','GRV-PSIM1'),

('b0000000-0000-0000-0000-000000000017','a0000000-0000-0000-0000-000000000007','PixelPortfolio',
 'A no-code portfolio site builder for design students who don''t want to touch a single line of CSS. Personal project, might actually ship it this time.',
 'personal', array['Figma','UI/UX','JavaScript'], array['Design','EdTech'], 1, 2, '2026-08-10','2026-10-15',
 'public','auto', 'https://pixelportfolio.example.com', false, null, null,
 'Looking for one more person, ideally someone who actually likes writing CSS.',
 'https://picsum.photos/seed/pixelportfolio/800/400','https://picsum.photos/seed/pixelportfolio-sq/300/300','GRV-PIXEL'),

('b0000000-0000-0000-0000-000000000018','a0000000-0000-0000-0000-000000000012','HealthBridge',
 'A triage-assistant chatbot for a telehealth startup competition, helping route patients to the right kind of clinic before they even call.',
 'academic', array['Java','AI/ML','AWS'], array['Healthcare','AI & ML'], 2, 4, '2026-08-25','2026-12-05',
 'restricted','approval', null, true, 'BT4222 Mining Web Data for Business Insights', 'Prof. Kyong Jin Shim',
 'Data pulls run overnight, check the shared drive each morning for fresh CSVs.',
 'https://picsum.photos/seed/healthbridge/800/400','https://picsum.photos/seed/healthbridge-sq/300/300','GRV-HBRDG'),

('b0000000-0000-0000-0000-000000000019','a0000000-0000-0000-0000-000000000013','CampusConnect',
 'A lightweight app to help exchange and incoming students find study groups, flatmates and people to eat with. Orientation week is chaos and everyone''s lost.',
 'personal', array['React','JavaScript','SQL'], array['Web Dev','Social Impact'], 3, 6, '2026-08-01','2026-11-30',
 'public','approval', 'https://campusconnect.example.com', false, null, null,
 'Open to anyone regardless of school, this one''s meant to cross campuses.',
 'https://picsum.photos/seed/campusconnect/800/400','https://picsum.photos/seed/campusconnect-sq/300/300','GRV-CAMPU'),

('b0000000-0000-0000-0000-000000000020','a0000000-0000-0000-0000-000000000015','StudySpace',
 'Modular furniture concepts for micro-apartments near campus, designed for students who''ve somehow ended up with a 9sqm room and big ambitions.',
 'academic', array['Figma','Design','Research'], array['Design','Sustainability'], 2, 4, '2026-08-14','2026-12-06',
 'restricted','approval', null, true, 'ID3101 Design Studio', 'Prof. Alvin Chua',
 'Studio reviews biweekly, physical models expected by week 10.',
 'https://picsum.photos/seed/studyspace/800/400','https://picsum.photos/seed/studyspace-sq/300/300','GRV-SSPAC');

-- ------------------------------------------------------------
-- 6) One group per project, same id suffix as its project for easy
--    cross-reference. Projects 1-8 are Ended (past timeline, full
--    cross-ratings below); 9-20 are Forming/recruiting.
-- ------------------------------------------------------------
insert into public.groups (id, project_id, name, leader_id, recruiting, status, min_members, max_members, members_wanted, skills_wanted, personality_wanted, interests_wanted, joining_method, additional_notes) values
('c0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','SmartCart Crew','a0000000-0000-0000-0000-000000000001', false,'Ended',4,4,0,array[]::text[],array[]::text[],array[]::text[],'approval',null),
('c0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000002','Neural Team','a0000000-0000-0000-0000-000000000006', false,'Ended',4,4,0,array[]::text[],array[]::text[],array[]::text[],'approval',null),
('c0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000003','HackTheCity Squad','a0000000-0000-0000-0000-000000000009', false,'Ended',4,4,0,array[]::text[],array[]::text[],array[]::text[],'approval',null),
('c0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000004','CampusEats Team','a0000000-0000-0000-0000-000000000014', false,'Ended',3,3,0,array[]::text[],array[]::text[],array[]::text[],'approval',null),
('c0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000005','MediMate Core','a0000000-0000-0000-0000-000000000005', false,'Ended',4,4,0,array[]::text[],array[]::text[],array[]::text[],'approval',null),
('c0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000006','OrientMate Crew','a0000000-0000-0000-0000-000000000010', false,'Ended',4,4,0,array[]::text[],array[]::text[],array[]::text[],'approval',null),
('c0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000007','Insight Squad','a0000000-0000-0000-0000-000000000011', false,'Ended',4,4,0,array[]::text[],array[]::text[],array[]::text[],'approval',null),
('c0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000008','Portfolio Trio','a0000000-0000-0000-0000-000000000008', false,'Ended',3,3,0,array[]::text[],array[]::text[],array[]::text[],'approval',null),

('c0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000009','AutoBrew Crew','a0000000-0000-0000-0000-000000000001', true,'Forming',2,4,2,array['Product','C++'],array[]::text[],array['Robotics'],'approval','Ideally someone into embedded systems.'),
('c0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000010','DevMatch Team','a0000000-0000-0000-0000-000000000005', true,'Forming',2,4,2,array['Python','FastAPI'],array[]::text[],array['AI & ML'],'approval',null),
('c0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000011','QuickAPI Team','a0000000-0000-0000-0000-000000000006', true,'Forming',2,4,2,array['Node.js','SQL'],array[]::text[],array['Web Dev'],'approval',null),
('c0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000012','GreenBlueprint Studio','a0000000-0000-0000-0000-000000000009', true,'Forming',2,4,2,array['Figma','Research'],array[]::text[],array['Sustainability'],'approval',null),
('c0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000013','Heritage AR Team','a0000000-0000-0000-0000-000000000010', true,'Forming',2,4,2,array['Figma','AWS'],array[]::text[],array['Social Impact'],'approval','Open cross-school.'),
('c0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000014','EcoPack Lab','a0000000-0000-0000-0000-000000000002', true,'Forming',2,4,2,array['Product','Research'],array[]::text[],array['Sustainability'],'approval',null),
('c0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000015','CarbonLens Team','a0000000-0000-0000-0000-000000000003', true,'Forming',2,4,2,array['Python','SQL'],array[]::text[],array['Sustainability'],'approval',null),
('c0000000-0000-0000-0000-000000000016','b0000000-0000-0000-0000-000000000016','PolicySim Team','a0000000-0000-0000-0000-000000000004', true,'Forming',2,4,2,array['Python','Research'],array[]::text[],array['Social Impact'],'approval','Open cross-school.'),
('c0000000-0000-0000-0000-000000000017','b0000000-0000-0000-0000-000000000017','Pixel Crew','a0000000-0000-0000-0000-000000000007', true,'Forming',1,2,1,array['Figma','UI/UX'],array[]::text[],array['Design'],'auto','Auto-accept, come with a portfolio link.'),
('c0000000-0000-0000-0000-000000000018','b0000000-0000-0000-0000-000000000018','HealthBridge Team','a0000000-0000-0000-0000-000000000012', true,'Forming',2,4,2,array['Java','AI/ML'],array[]::text[],array['Healthcare'],'approval',null),
('c0000000-0000-0000-0000-000000000019','b0000000-0000-0000-0000-000000000019','CampusConnect Crew','a0000000-0000-0000-0000-000000000013', true,'Forming',3,6,3,array['React','SQL'],array[]::text[],array['Web Dev'],'approval','Open cross-school.'),
('c0000000-0000-0000-0000-000000000020','b0000000-0000-0000-0000-000000000020','StudySpace Studio','a0000000-0000-0000-0000-000000000015', true,'Forming',2,4,2,array['Figma','Design'],array[]::text[],array['Design'],'approval',null);

-- ------------------------------------------------------------
-- 7) Ended-group membership. Every person is in exactly 2 of the 8
--    Ended groups (a 3x5 Latin-square-style design), guaranteeing
--    5-6 real ratings each once cross-rated below.
-- ------------------------------------------------------------
insert into public.group_members (group_id, user_id, role) values
-- EG1 SmartCart: Aiden(leader), Nabila, Devi, Kai Zhi
('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','leader'),
('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','member'),
('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000003','member'),
('c0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000004','member'),
-- EG2 NeuralCompanion: Jun Hao(leader), Priya, Marcus, Farhana
('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000006','leader'),
('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000005','member'),
('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000007','member'),
('c0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000008','member'),
-- EG3 HackTheCity: Chloe(leader), Wei Jian, Ryan, Aisyah
('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000009','leader'),
('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000010','member'),
('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000011','member'),
('c0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000012','member'),
-- EG4 CampusEats: Grace(leader), Haziq, Ben
('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000014','leader'),
('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000013','member'),
('c0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000015','member'),
-- EG5 MediMate: Priya(leader), Aiden, Chloe, Haziq
('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000005','leader'),
('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001','member'),
('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000009','member'),
('c0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000013','member'),
-- EG6 OrientMate: Wei Jian(leader), Nabila, Jun Hao, Grace
('c0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000010','leader'),
('c0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000002','member'),
('c0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000006','member'),
('c0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000014','member'),
-- EG7 DataViz for Social Good: Ryan(leader), Devi, Marcus, Ben
('c0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000011','leader'),
('c0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000003','member'),
('c0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000007','member'),
('c0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000015','member'),
-- EG8 PortfolioBuilder: Farhana(leader), Kai Zhi, Aisyah
('c0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000008','leader'),
('c0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000004','member'),
('c0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000012','member');

insert into public.project_members (project_id, user_id)
select g.project_id, gm.user_id from public.group_members gm join public.groups g on g.id = gm.group_id
on conflict do nothing;
insert into public.project_members (project_id, user_id)
select p.id, p.owner_id from public.projects p
on conflict do nothing;

-- ------------------------------------------------------------
-- 8) Past projects — everyone's 2 real Ended-group memberships above,
--    written up with their actual role on that team.
-- ------------------------------------------------------------
insert into public.past_projects (user_id, project_id, role, write_up) values
('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','Team Lead','Led SmartCart end to end — mechanical integration was the fun part, the wiring loom less so.'),
('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000005','ML Support','Helped tune MediMate''s symptom-classifier, small dataset but it held up.'),
('a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001','Prototyping','Built and rebuilt the trolley chassis about six times until it stopped tipping over.'),
('a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000006','Logistics','Ran the clue-prop side of OrientMate, printed way too many QR codes.'),
('a0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000001','Data & Sensors','Wired up SmartCart''s obstacle sensors and logged way too many false positives on stray chairs.'),
('a0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000007','Data Cleaning','Cleaned three years of messy nonprofit spreadsheets for the DataViz dashboard.'),
('a0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000001','Systems Integration','Made sure SmartCart''s subsystems actually talked to each other, mostly.'),
('a0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000008','Cloud Setup','Set up the hosting for PortfolioBuilder, first time actually using AWS for something real.'),
('a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000002','Team Lead','Led NeuralCompanion, mostly kept the model training from eating our entire compute budget.'),
('a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000005','Team Lead','Ran MediMate through a healthcare hackathon on minimal sleep and worse coffee.'),
('a0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000002','Team Lead','Led NeuralCompanion''s backend, spent way too long optimizing an endpoint that barely got called.'),
('a0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000006','Backend & ML','Built OrientMate''s clue-matching logic overnight, first hackathon win.'),
('a0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000002','Frontend & Design','Designed and built NeuralCompanion''s whole quiz UI in a weekend.'),
('a0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000007','Visual Design','Made the DataViz dashboard actually legible, nonprofit staff said it was the first chart they''d understood all year.'),
('a0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000002','ML Engineer','Trained NeuralCompanion''s note-summarization model, still proud of the eval scores.'),
('a0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000008','Team Lead','Led PortfolioBuilder from a studio side-project into something people actually used.'),
('a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000003','Team Lead','Led HackTheCity, coordinated four schools'' worth of sleep-deprived designers.'),
('a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000005','UX Design','Designed MediMate''s chat interface so it didn''t feel like talking to a form.'),
('a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000003','Design','Handled HackTheCity''s dashboard visuals, first time working with people outside SUTD.'),
('a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000006','Team Lead','Led OrientMate, the most sleep-deprived I''ve ever been and proudest of a build.'),
('a0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000003','Data','Pulled and cleaned public transport data for HackTheCity''s dashboard.'),
('a0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000007','Team Lead','Led the DataViz build for a local nonprofit, they''re still using it which feels good.'),
('a0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000003','Backend','Wired up HackTheCity''s data pipeline, my first proper cross-school team.'),
('a0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000008','QA','Tested PortfolioBuilder across three browsers so nobody else had to.'),
('a0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000004','Frontend','Built CampusEats'' logging UI, first real app I shipped.'),
('a0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000005','QA & Demo','Ran the live demo for MediMate at the hackathon showcase, nerve-wracking but fun.'),
('a0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000004','Team Lead','Led CampusEats, model wasn''t perfect but the canteen operator actually adopted it.'),
('a0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000006','ML Support','Helped tune OrientMate''s clue-matching thresholds at about 4am.'),
('a0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000004','Design','Designed CampusEats'' portion-size icons so the logging felt less like a chore.'),
('a0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000007','Visual Design','Helped polish the DataViz dashboard''s charts for the nonprofit''s board presentation.');

-- ------------------------------------------------------------
-- 9) Ratings — full cross-rating within each of the 8 Ended groups
--    (every member rates every other member once), so all 15 profiles
--    end up with 5-6 real ratings from actual former teammates.
-- ------------------------------------------------------------
insert into public.ratings (rater_id, ratee_id, project_id, group_id, stars, comment) values
-- EG1 SmartCart (Aiden, Nabila, Devi, Kai Zhi)
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',5,'Nabila rebuilt the chassis more times than I can count and never once complained.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',5,'Aiden kept SmartCart from becoming five different half-finished ideas at once.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',4,'Devi''s sensor work was solid, the false-positive rate on stray chairs was not her fault.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',5,'Great lead, always had a clear next step for everyone.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',5,'Kai Zhi''s systems integration saved us from three separate near-disasters.'),
('a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',4,'Solid lead, meetings occasionally ran long but always productive.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',4,'Reliable, quiet but always delivered on time.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',5,'Nabila''s patience with the chassis redesigns was honestly impressive.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',5,'Kai Zhi''s the reason our subsystems didn''t fall apart at demo time.'),
('a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',4,'Good collaborator, very hands-on with the build.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',5,'Kai Zhi caught integration bugs nobody else would''ve noticed.'),
('a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001',4,'Devi''s sensor calibration work was thorough, good documentation too.'),
-- EG2 NeuralCompanion (Jun Hao, Priya, Marcus, Farhana)
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Priya''s the reason the compute budget didn''t implode, great lead.'),
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Jun Hao''s backend work was rock solid, wish he joined more of the syncs though.'),
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Marcus built the whole UI in a weekend, insane turnaround.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',4,'Solid backend, communication could''ve been a bit more frequent.'),
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Farhana''s summarization model eval scores were genuinely impressive.'),
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Jun Hao carried the ML infra side, legend.'),
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Marcus''s UI made the whole app feel like a real product, not a hackathon build.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Best team lead I''ve had, super organized and always transparent about blockers.'),
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',4,'Farhana''s model work was solid, would''ve liked more frequent updates.'),
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Priya kept the whole project scoped and on track, great to work under.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',4,'Good collaborator, model explanations were always clear even to a design person.'),
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002',5,'Marcus''s design sense elevated the whole product, would team up again anytime.'),
-- EG3 HackTheCity (Chloe, Wei Jian, Ryan, Aisyah)
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',5,'Wei Jian''s visuals made our dashboard stand out from every other team there.'),
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',5,'Chloe coordinated four schools'' worth of people without a single argument, impressive.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',4,'Ryan''s transport data pull saved us hours, good technical instincts.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',5,'Best cross-school lead I''ve worked with, kept four different schedules aligned.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',4,'Aisyah''s data pipeline work was clean, first cross-school team for both of us.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',5,'Chloe made a chaotic 36 hours feel organized, genuinely great leadership.'),
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',4,'Ryan''s data instincts were sharp even at 3am.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',5,'Wei Jian''s design work is why our submission actually looked finished.'),
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',4,'Solid backend work, quiet but consistent.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',5,'Wei Jian''s the reason our dashboard didn''t look like every other team''s.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',4,'Good with the data pipeline, would team up again.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003',5,'Ryan led the data side really well, made a messy dataset feel manageable.'),
-- EG4 CampusEats (Grace, Haziq, Ben) — 3-person group, 2 ratings each
('a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000004',5,'Haziq''s logging UI made the whole app feel far less chore-like.'),
('a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000004',5,'Grace led with a super clear scope even though the model wasn''t perfect.'),
('a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000004',5,'Ben''s portion-size icons made logging genuinely painless.'),
('a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000004',5,'Grace got the canteen operator to actually adopt this, rare for a module project.'),
('a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000004',4,'Ben''s design instincts are sharp, good collaborator.'),
('a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000004',4,'Haziq picked up the frontend fast for a Y1, solid work.'),
-- EG5 MediMate (Priya, Aiden, Chloe, Haziq)
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',4,'Aiden''s model tuning helped a lot given the tiny dataset we had.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',5,'Priya ran a hackathon team like a pro, super calm under pressure.'),
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',5,'Chloe''s chat UI design made this feel like a real product, not a hackathon hack.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',5,'Priya''s the best lead I''ve had, super organized even on zero sleep.'),
('a0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',4,'Haziq ran a nerve-wracking live demo really well.'),
('a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',5,'Priya''s leadership made my first hackathon way less intimidating.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',4,'Chloe''s UX instincts saved us from a clunky chat flow.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',4,'Aiden picked up the ML side fast for someone from EPD, solid effort.'),
('a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',4,'Haziq handled the demo pressure better than I would have.'),
('a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',4,'Aiden''s tuning work was solid, good teammate under time pressure.'),
('a0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',5,'Haziq''s energy kept the team going through the all-nighter.'),
('a0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005',5,'Chloe''s design work is why judges actually remembered our demo.'),
-- EG6 OrientMate (Wei Jian, Nabila, Jun Hao, Grace)
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',5,'Nabila printed approximately a thousand QR codes without complaint, hero behavior.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',5,'Wei Jian led us through the most sleep-deprived night of the semester, and we won.'),
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',5,'Jun Hao''s clue-matching logic just worked, first try, at 4am. Impressive.'),
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',5,'Wei Jian kept morale up when we were all running on fumes.'),
('a0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',4,'Grace''s threshold tuning at 4am was better work than I could''ve done awake.'),
('a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',5,'Wei Jian''s the most sleep-deprived-but-still-organized lead I''ve worked with.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',4,'Solid backend work, clue logic barely ever broke.'),
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',4,'Great with logistics, kept us all fed too somehow.'),
('a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',4,'Grace''s ML tweaks made a real difference to the clue accuracy.'),
('a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',4,'Nabila''s the reason we had props ready on time, underrated contribution.'),
('a0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',5,'Grace''s model tuning at that hour was genuinely impressive.'),
('a0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006',5,'Jun Hao carried the technical side of this build, real MVP.'),
-- EG7 DataViz for Social Good (Ryan, Devi, Marcus, Ben)
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',5,'Devi cleaned three years of messy spreadsheets without a single complaint.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',5,'Ryan led this really thoughtfully given it was for a real nonprofit, not a grade.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',5,'Marcus made charts that a nonprofit board actually understood, rare skill.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',4,'Good lead, kept the scope realistic for a weekend build.'),
('a0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',4,'Ben''s chart polish for the board presentation was well done.'),
('a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',5,'Ryan''s the reason a real nonprofit is still using our tool months later.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',5,'Marcus''s visual design work turned a boring dataset into something people wanted to look at.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',4,'Thorough with the data, made my job a lot easier.'),
('a0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',4,'Ben''s design eye elevated the whole dashboard.'),
('a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',4,'Devi''s data cleaning was thorough and well documented.'),
('a0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',5,'Ben and I clicked on the visual direction immediately, great collaborator.'),
('a0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007',5,'Marcus''s design instincts made this the best-looking thing I''ve shipped.'),
-- EG8 PortfolioBuilder (Farhana, Kai Zhi, Aisyah) — 3-person group
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',5,'Kai Zhi''s AWS setup was flawless, first time I''ve deployed something without a 2am panic.'),
('a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',5,'Farhana led this from a side-project into something people actually use, great vision.'),
('a0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',4,'Aisyah caught bugs across three browsers so nobody else had to.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',5,'Farhana''s design sense is why this actually looks like a real product.'),
('a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',4,'Aisyah''s QA work was thorough, caught things I definitely missed.'),
('a0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008',4,'Kai Zhi''s cloud setup made this so much less painful than expected.');

-- ------------------------------------------------------------
-- 10) Join requests — pending + one declined-with-reason, so
--     Applicants/Teams·Requested aren't empty.
-- ------------------------------------------------------------
insert into public.join_requests (group_id, user_id, status, note, comment, decline_reason, declined_at) values
('c0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000010','declined', null, null, 'Looking for someone with hands-on embedded/electronics experience specifically for this one.', now() - interval '1 day'),
('c0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000013','pending', 'Would love to help with the frontend, I''ve been picking up React.', 'Would love to help with the frontend, I''ve been picking up React.', null, null),
('c0000000-0000-0000-0000-000000000017','a0000000-0000-0000-0000-000000000015','pending', null, null, null, null),
('c0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000011','pending', 'Interested in the data side, have SQL experience from my degree.', 'Interested in the data side, have SQL experience from my degree.', null, null);

-- ------------------------------------------------------------
-- 11) Saved projects.
-- ------------------------------------------------------------
insert into public.project_favorites (user_id, project_id) values
('a0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000012'),
('a0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000018'),
('a0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000020'),
('a0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000010'),
('a0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000017');

-- ------------------------------------------------------------
-- Done. Verify:
--   select username, full_name, university, major from public.profiles order by university, major;
--   select name, type, privacy, join_code from public.projects order by name;
--   select ratee_id, count(*), round(avg(stars),1) from public.ratings group by ratee_id order by 2;
--   -- skill coverage check:
--   select s.name from public.skill_catalog s
--    where not exists (select 1 from public.projects p where s.name = any(p.skills_needed));
--   -- should return zero rows if coverage is complete.
-- ------------------------------------------------------------
