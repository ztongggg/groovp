# Groovp — Handoff / Context

Paste this into a new chat to continue. It captures everything about the project.

## What Groovp is
Mobile-web app for SUTD students to **find & evaluate teammates** (coursework, hackathons, research, side projects) matched on skills, personality/working-style, interests, location. Built from a Figma prototype into a real, live, multi-user app.

- **Live:** https://groovp.vercel.app
- **Repo:** `C:\Users\limzh\OneDrive\Documents\GitHub\groovp` → GitHub `ztongggg/groovp` (branch `main`)
- **Stack:** Next.js 14 (App Router, plain JS/JSX, `@/*` alias) · Tailwind · Supabase (Postgres + Auth + RLS) · Vercel
- **Frame:** iPhone 402×874. `components/PhoneFrame.jsx` (in `app/layout.jsx`) wraps every page — bezel+notch on desktop, full-bleed on mobile. `components/AppShell.jsx` = 402px column + bottom nav. `components/StatusBar.jsx` = 9:41 bar.

## How to run / deploy
- Dev: `cd` into repo, `npm run dev` (:3000). **Local server-side Supabase/DB calls FAIL** (corporate proxy TLS `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`) — all DB reads are wrapped `try/catch → []` so pages still render locally; **real data only works on Vercel**. So: build changes, commit, user pushes via **GitHub Desktop** (non-interactive shell can't auth git push — cert fixed via `git config http.sslBackend schannel`), Vercel auto-deploys, then verify live.
- `npm run build` works locally (font loads via `<link>`, not next/font, so no build-time fetch).
- Env in `.env.local` (gitignored): `NEXT_PUBLIC_SUPABASE_URL=https://cvlvrousapvmamkcexpl.supabase.co`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...`, `FIGMA_TOKEN=figd_...`. **NEXT_PUBLIC_* are inlined at build** → after changing env in Vercel, redeploy WITHOUT cache. Vercel has both NEXT_PUBLIC vars (Production scope).

## Supabase
- Project ref `cvlvrousapvmamkcexpl`. Email confirmation is **OFF** (instant login).
- Schema: `supabase/schema.sql` (v1) + `supabase/schema_v2.sql` (v2, additive) — both already run. Tables: profiles, projects, groups, group_members, join_requests, ratings, messages, **user_skills**(Basic/Pro/Expert), **project_favorites**, **past_projects**, **conversations**+**conversation_participants**, **notifications**, **reports**, **blocks**. RLS on all. Leader policies: `requests_leader_update`, `members_leader_insert`. `cpart_write` relaxed to `with check(true)` (so chat creator can add the other participant). `handle_new_user` trigger auto-creates a profile row on signup.
- Run SQL: user pastes into SQL Editor (https://supabase.com/dashboard/project/cvlvrousapvmamkcexpl/sql/new). Verify a table exists: `fetch('.../rest/v1/<table>?limit=1',{headers:{apikey:'<publishable>'}})` → 404 = missing.

## Test accounts (all password `test1234`)
- `flowtest1@sutd.edu.sg` — owns project "AI Study Buddy", username `flow_leader`, rated 5★. Use for **leader** side.
- `onboard1@sutd.edu.sg` — rich profile (Python/React/Figma), member of AI Study Buddy.
- `onboard2@sutd.edu.sg` — owns "EcoTrack SG".
- `onboard4@sutd.edu.sg` — Python·Expert/Figma·Pro.
- (onboard3 = broken empty profile, pre-migration; ignore.)

## Routes / features — ALL BUILT + VERIFIED LIVE
- `/login` (pixel-exact Figma Welcome, real mascot asset) · `/signup` (5-step: basics→about+gender→personality→skills w/ Basic-Pro-Expert→interests; real cloud asset) · `/forgot-password` · `/edit-profile` (+retake personality)
- `/home` (real greeting name, real projects, ✨Strong Match badge [≥2 shared skills/interests], bell→notifications w/ unread dot, Saved+Requests shortcuts) · `/saved`
- `/discover` (real projects, search/filter/+, Strong Match, tap→details) · `/create` (4-step: type→basics→group settings→privacy→congrats) · `/project/[id]` (navy banner, Info/Groups tabs, recruiting status, leader Manage link, favorite heart, join)
- `/recruiting/[groupId]` (leader-only: recruiting toggle, members-wanted, wanted skills/personality/interests, notes, joining method)
- `/applicants` (leader: Pending accept/decline + History; from Home Requests) · join request → notifies leader; accept → notifies applicant + adds member
- `/teams` (merged inbox: group chats + private DMs; My Teams / Requested tabs) · `/chat/[groupId]` (group) · `/dm/[conversationId]` (private, from Message on a profile)
- `/profile` (real data: name/@user/year·major, personality stat grid, skills w/ neutral proficiency badges, interests, rating, About/Project tabs, past projects, logout) · `/u/[id]` (other user: Message, Rate 1-5+comment, ⋯ Report/Block) · `/settings` (edit profile, change password, logout) · `/notifications`
- Empty states (discover/teams/notifications) use real Figma illustrations.

## Business rules honored (spec §5)
Single 1-5 ratings (no sub-categories) · skill proficiency EXACTLY Basic/Pro/Expert, NEUTRAL gray badges · personality once-at-signup + retake · recruiting PER-GROUP · Academic(multi-group)/Personal(1 group) structural fork · full 5-step signup · full applicant identity · Strong Match highlights shared tags.

## Figma "exact" method (for pixel-perfect illustrations)
Layout/colors/text already exact-from-node. Illustrations = export real asset: get node id (fetch frame children, find INSTANCE/illustration), `GET /v1/images/wA2wiOAqWkKr9JI319d5wT?ids=NODE&format=png&scale=3` → download to `public/` → `<img src="/x.png">` at exact coords. `.gitignore` has `*.png` but `!public/*.png` exempts app assets. File key `wA2wiOAqWkKr9JI319d5wT`. Figma "Final" page (561:2890) is the source of truth; node IDs drift — resolve by name. **Figma token expires (~days)** → regenerate at figma.com/settings→Security, update `.env.local`.
Embedded real assets in `public/`: signup-cloud, login-mascot, blob-teal/pink/orange (Teams avatars), empty-search/teams/notif. Home banner face = exact shapes (skin #c4b5fd, white glasses).

## Test-automation gotchas (browser)
- `useFormState` injects hidden `$ACTION_*` inputs FIRST → fill form inputs by **name** (`input[name=email]`), not index.
- React controlled inputs: set value via native setter + dispatch `input` event. Chips/buttons: `el.click()`. Forms: `form.requestSubmit()` (plain automated left_click often doesn't fire React handlers).
- Nested Supabase embeds `table(col)` sometimes return null on Vercel → use separate queries for side-effect paths (notifications used this fix).
- Sessions expire between long gaps → re-login.

## Remaining / out of scope
Only spec §6 deliberately-unbuilt items left: moderation review tooling (submission works), invite-by-username follow-up, reapply-after-decline conflict flow. Icon set is inline-SVG approximations of Figma's Simple Design System icons (low ROI to swap). Everything else done.

## Working style / prefs
British/clean copy. Owner wants exact Figma fidelity + real backend. Deploy cadence: build+commit locally, user pushes via GitHub Desktop + says "deployed", then verify live on Vercel. Caveman mode was on (terse).
