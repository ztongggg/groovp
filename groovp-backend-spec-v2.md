# Groovp — Backend Specification (v2, based on Final Figma)

**Purpose:** everything needed to build the API and data model for Groovp, a student team-matching platform (SUTD). This supersedes the earlier draft — it's built directly from the **Final** Figma page (83 frames, 13 organized sections, fully wired, verified 0 dangling links) after a full voice walkthrough and content audit with the product owner.

---

## 1. Product Overview

Groovp helps students find and evaluate teammates for coursework, hackathons, research, and personal side projects — based on skills, personality/working-style compatibility, and interests, not just existing friend networks.

Three core features:
1. **Compatibility Matching** — skills + personality + interests drive a "Strong Match" indicator, with the *specific* matching attributes visually highlighted (not just a badge)
2. **Project & Team Discovery** — browse, filter, request to join
3. **Transparent Team Formation** — leaders review applicants (with left/right paging between candidates), accept/decline, track status both ways

---

## 2. Core Data Entities

### User
- `id`, `name`, `username`, `email`, `password_hash`
- `avatar_color` — enum, the mascot's fill color (illustrated character, not a photo upload). **Shape convention: person avatars are always circular.**
- `university`, `major`, `year_of_study` (Y1–Y4, or "Other")
- `gender`: Woman | Man | Prefer not to say (confirm exact enum with product — walkthrough said "female, male, prefer not to say")
- **Personality** (captured at Signup Step 3, editable via Edit Profile):
  - `personality_type`: Introvert | Extrovert
  - `work_preference`: Online | Face-to-face
  - `work_time`: Morning | Night Owl
  - `location`: North | South | East | West | Campus | Central *(6 options — confirmed exact set)*
- `skills`: array of `{ skill_name, proficiency }` — proficiency is exactly **Basic | Good | Expert** (do not use "Pro" — this was corrected during this pass; also note the level *selector* itself must always render all 3 options, a prior bug removed the middle option from the UI)
- `interests`: array, values drawn **only** from this fixed set of 9 — do not allow free text or other values:
  `Sustainability | EdTech | Web Dev | Healthcare | Data Science | Social Impact | Robotics | AI & ML | Design`
- `rating_average`, `rating_count`
- `portfolio_links`: array of `{ platform, url }` — platforms at minimum LinkedIn, GitHub, generic "Portfolio Website"; managed via the **Projects & Links** screen, also collectible (skippable) at Signup Step 6
- `is_blocked_by: [user_id]`
- `profile_completeness_pct` — derived/computed, shown on My Profile ("Profile 80% complete") — needs a defined formula (see Open Questions)

### Project
- `id`, `name`, `description`, `owner_id`
- `type`: **Academic** | **Personal** — Academic supports multiple independent Groups; Personal has exactly one
- `cover_image` — the wide banner shown on project cards (Home/Discover); **not** an avatar, a separate visual asset, no shape convention applies
- `photo` — **rounded-square** project/group photo shown during creation (Create Project Step 1) and representing the project/group identity elsewhere (e.g. Teams inbox row, Group Info hero). This was previously bugged as a circle in both creation flows — fixed to rounded-square (cornerRadius ≈ 0.32 × width, matching the existing Teams-inbox convention) during this pass.
- `skills_needed`, `interests_needed` (interests must come from the same fixed 9)
- `timeline_start`, `timeline_end`
- `course_code`, `instructor` (Academic only)
- `things_to_note` (free text)
- `resource_link` (optional URL) **and** `resource_files` (optional real file upload — confirmed both exist on Create Project Step 2: a link field plus a genuine drag-and-drop uploader restricted to JPEG/PNG/PDF/MP4, 50MB max)
- `privacy`: Public (visible in everyone's Discover) | Restricted (visible only to users from the same school) | Invite-only (accessible only via direct link)
- `is_saved_by: [user_id]` (heart/save icon → **Saved Projects** screen)

### Group
- `id`, `project_id`, `name`, `leader_id`
- `photo` — rounded-square, same convention as Project
- `status`: Forming | Active | Ended
- `member_ids`, `min_members`, `max_members`
- **Recruiting** (per-group toggle, independent even across groups sharing one Academic project):
  - `is_recruiting`: boolean
  - `skills_wanted`, `personality_wanted`, `interests_wanted` (interests from the fixed 9)
  - `additional_notes`

### JoinRequest
- `id`, `group_id`, `applicant_id`, `note` (optional, entered on the Join Request Modal)
- `status`: Pending | Accepted | Declined
- `applied_at`
- `match_score`: computed — see Matching Logic below. Drives the "Strong Match" badge AND which specific skill/interest/personality attributes get highlighted green on the applicant's profile when a leader reviews them
- **Duplicate prevention**: backend must reject or gracefully handle a second JoinRequest from the same (applicant, group) pair — **not designed in the UI**, flagged as a backend-only concern by the product owner

### Rating
- `id`, `project_id`, `group_id`, `rater_id`, `ratee_id`
- `stars`: 1–5, single overall value (explicitly not category-based)
- `comment`: optional
- `created_at`

### PastProjectEntry
- `id`, `user_id`, `project_id`, `role`, `write_up`, `photos: [image]`
- Created two ways: (1) automatically offered after rating teammates when a project ends, (2) manually via **Projects & Links → + Add Project**, using the same **Edit Project** form either way

### Message / Conversation
- `type`: Group | Private
- Merged single inbox (**Teams**) sorted by most-recent-message; ended-project group chats show a muted state
- `Message`: `id`, `conversation_id`, `sender_id`, `text`, `sent_at`

### Notification
- `id`, `user_id`, `type` (join_accepted | new_join_requests | new_message | rate_reminder), `related_id`, `read`, `created_at`

### Report / Block
- `Report`: `reporter_id`, `reported_user_id`, `reason` (Fake profile | Inappropriate behavior | Spam/scam | Harassment | Other), `details`, `status`
- `Block`: `blocker_id`, `blocked_id`, reversible via Settings → Blocked Users

---

## 3. Complete Screen Inventory (by Figma section)

### Logging In
| Screen | Purpose |
|---|---|
| Welcome Page | Email/username + password login; links to Sign up and Forgot Password |
| Welcome Page - Error State | Wrong credentials |
| Forgot Password | Email input → triggers reset link |
| Forgot Password – Confirmation | "Check your email" |

### Onboarding (13 screens)
| Screen | Captures / Purpose |
|---|---|
| Onboarding – Splash | Brand intro, tagline about compatibility-based team building |
| Signup – Intro | "Just 6 questions before you start" |
| Step 1 Introduce Yourself | Photo, full name, username, email, password |
| Step 2 About Me | University, major, year, gender |
| Step 3 Personality | The 4 personality questions (see User entity) |
| Step 4 Skills (+ Searching sub-state) | Skill selection + Basic/Good/Expert proficiency per skill |
| Step 5 Interests | Choose from the fixed 9 |
| Step 6 Projects & Links (4 states: Empty / Filled / Add Project / Add Project - filled) | Optional, skippable — add portfolio links and/or a first project |
| Signup – Complete | Success → routes to **Home - No Recent Projects** (first-time state) |

### Home + Discover (14 screens)
| Screen | Purpose |
|---|---|
| Home - No Recent Projects | First-time state, browsable Popular/Latest project feed |
| Home | Returning-user state: Saved button, Requests button, Recently Viewed section, Popular/Latest tabs, project feed, bell → Notifications |
| Discover | Full browse + search; filter icon → Filter Panel |
| Filter Panel | Skills needed, Interests needed (fixed 9), Timeline, Team size — **no Personality filter** (explicitly confirmed: filtering is project-matching, not personality-matching) |
| Saved Projects | Bookmarked projects (heart icon elsewhere) |
| Project Details | Single-group or entry point to multi-group view; shows course info, resource link, "things to note" |
| Project Details (Groups) | Academic multi-group breakdown; "+ Start a New Group" |
| Group Info - Request Others | Non-member preview of a specific group: members, what they're recruiting for (skills/personality/interests wanted) → "Request" |
| Start a New Group | Group photo (rounded-square), name, team size, skills/interests needed — **no joining-method selector here**, that's Recruiting Settings' job later |
| Join Request Modal | Optional note → Send |
| Request Sent Confirmation | Success state → "Keep Browsing" (Discover) or "View Request Status" (Teams - Requested) |
| Notifications | Update feed, each item routes to its relevant screen |
| Empty – No Search Results / No Notifications | Conditional empty states |

### Create Project — 3 sections, 15 screens total
Academic and Personal are near-identical flows; **the only structural difference is Group Settings has a "number of groups" field for Academic only** — everything else (photo, name, description, dates, team size, skills/interests needed, resource link, privacy, congrats) is shared.
| Screen | Notes |
|---|---|
| Step 0 Type (+ Error state) | Academic vs Personal choice |
| Academic: Step 1 Basics, Step 2 Group Settings, Step 3 Privacy, Congrats (+ 2 Error states) | |
| Personal: Step 0–3 + Congrats (parallel, no error states built) | |
| Privacy options | Public (everyone's Discover) / Restricted (same-school only) / Invite-only (link-only access) |

### Team Messages (4 screens)
| Screen | Purpose |
|---|---|
| Teams | Merged group + private chat inbox, "My Teams"/"Requested" tabs |
| Teams - Search | In-inbox search |
| Teams - Requested | Status of **your own** sent join requests (Pending/Accepted/Declined) |
| Empty – No Teams Yet | |

### Request to join my group (3 screens) — the leader's side
| Screen | Purpose |
|---|---|
| Request History | Leader reviews pending + historical applicants; tapping a pending applicant opens their profile |
| User A Profile - Requested / User B Profile - Requested | **Toggle-able via left/right paging** ("‹ 1 of 2 ›") between multiple pending applicants without returning to the list. Matching skills/interests are highlighted green with a border when the applicant is a Strong Match (confirmed: not every applicant gets this treatment — it's meant to visually contrast strong vs. weak matches) |

### Private Chat (3 screens)
| Screen | Purpose |
|---|---|
| Private Chat with User A | 1:1 messaging |
| User A Profile | Viewing someone generally (not mid-review) — Message, "⋯" → Report/Block |
| Empty – No Messages Yet | |

### Group (10 screens) — a group's internal management
| Screen | Purpose |
|---|---|
| Group Chat | Standard messaging, header → Group Info |
| Invite Member | Manual search-and-invite |
| Edit Group | Name/photo/members, Leave Group, End Project |
| Group Info - Recruiting On / Off | Toggle-driven: On shows the full skills/personality/interests-wanted breakdown + pending requests preview; Off shows neither |
| Recruiting Settings - On / Off | Where the wanted-criteria are actually configured |
| End Project Confirmation → Rate Teammates → Add Project to Profile | Sequential end-of-project flow, ratings and profile-project-add both skippable |

### My Profile (10 screens)
| Screen | Purpose |
|---|---|
| My Profile | Header, profile-completeness card, Skills/Interests summary (each with a proficiency badge per skill), About/Project tabs |
| My Profile - Project Tab | Past projects, "Manage projects & links" entry |
| Edit Profile | Editable core fields; Skills/Interests are now **summary rows linking to dedicated screens**, not inline chip editors |
| Edit Skills / Edit Interests | Dedicated editing screens (added this pass — previously had zero entry point from Edit Profile, now fixed) |
| Ratings History | Reviews-style list with star-distribution summary |
| Past Project Detail | Read-only view |
| Projects & Links | Manage portfolio links + past projects (add/edit) |
| Empty – No Ratings Yet | |
| Error – Something Went Wrong | Generic reusable failure fallback |

### Report (3 screens) + Settings (6 screens)
Standard moderation flow (Report reason picker, Block confirmation, Options menu) and settings list (Account/Preferences/Safety groupings, including Blocked Users).

---

## 4. Key Business Rules

1. **Ratings are single-value only** (1–5 stars + optional comment) — no category breakdown, deliberately.
2. **Skill proficiency is exactly 3 levels: Basic, Good, Expert.** Do not use "Pro" — corrected during this pass, was a naming inconsistency across screens.
3. **Interests are a closed set of exactly 9** — Sustainability, EdTech, Web Dev, Healthcare, Data Science, Social Impact, Robotics, AI & ML, Design. Do not allow free text. This was enforced retroactively across 20+ example instances that had drifted from this list during design iteration — the backend should treat this as a strict enum, not a free-form tag system, precisely to prevent that drift from happening again in production data.
4. **Location has exactly 6 options**: North, South, East, West, Campus, Central.
5. **Recruiting is per-Group, not per-Project** — independently toggleable even for groups sharing one Academic project.
6. **Filter Panel filters on Skills/Interests/Team size/Timeline only — never Personality.** Personality drives match *scoring* (see below) but is not a user-facing filter, by explicit product decision: "the filtering is for projects, so they're looking to match skills and interest not personality."
7. **Avatar shape convention**: individual people are always circular avatars (whether shown alone, in a stack of group members, or as an applicant). Groups/projects are always rounded-square (corner radius ≈ 32% of width) when represented as a single entity/icon — e.g. a Teams inbox row, a group's hero image, or the photo set during project/group creation. This was inconsistently applied in two places (both Create Project photo fields were circular) and has been corrected.
8. **Matching Logic drives 2 UI behaviors, not just 1 badge**: (a) a "Strong Match" badge, and (b) highlighting the *specific* matching skills/interests in green with a border on the applicant's profile. Both must be computed from the same underlying score — a partial match should highlight only the matching attributes, not all of them, and should not show the Strong Match badge at all if below the threshold (confirmed applicants are *not* all strong matches — this contrast is intentional).
9. **No reapplication prevention is designed in the UI** — this is an explicit backend responsibility per the product owner. Decide and enforce: block duplicate pending requests, or allow reapplication after a Decline (with what cooldown, if any).

---

## 5. Matching Algorithm (confirmed logic)

Two match computations, same underlying method, different input pairs:

**Applicant ↔ Group** (drives Request History / applicant profile "Strong Match")
**User ↔ Project** (drives Discover recommendations and the "Strong applicant" style badges seen on some Home cards)

```
overlap_count =
    |applicant.skills ∩ group.skills_wanted|
  + |applicant.interests ∩ group.interests_wanted|
  + |applicant.personality_traits ∩ group.personality_wanted|

is_strong_match = overlap_count >= 2   // "a few overlapping," not just one

highlighted_attributes = the specific overlapping skills/interests/personality —
    these are exactly what render with the green fill + border on the
    applicant's profile. Only overlapping attributes get highlighted;
    everything else stays neutral, even for a Strong Match applicant.
```

For **User ↔ Project** matching (no personality_wanted at the project level —
Group Settings only captures skills_needed/interests_needed, not a
personality target), the formula drops that term:
```
overlap_count = |user.skills ∩ project.skills_needed| + |user.interests ∩ project.interests_needed|
is_strong_match = overlap_count >= 2
```

**Confirmed via product walkthrough**: not every applicant/project pairing
should be a Strong Match — this is intentional contrast, not a bug. The
threshold of 2 is a reasonable default but should be tunable (a config
value, not hardcoded), since "a few" is inherently a product-tunable
concept, not a fixed spec.

---

## 6. Validation & Business Logic Rules (backend-enforced, not shown in UI)

None of these have error states designed in Figma — the prototype shows
the happy path only. Backend must enforce all of them regardless.

### Create Project
- `timeline_start` **must be before** `timeline_end`
- Both dates should be validated as not absurdly in the past (warn or
  block creating a project that already "ended" before it started)
- `min_members` **must be ≤** `max_members`, and `min_members` **≥ 1**
- Academic only: `number_of_groups` **≥ 1**
- Resource file upload: restrict to **JPEG, PNG, PDF, MP4**, max **50MB**
  (this is stated as UI copy already — "JPEG, PNG, PDF, and MP4 formats,
  up to 50 MB" — backend must actually enforce it, not just display it)
- `project_name` required, reasonable max length (suggest 80 chars)
- `description` required, reasonable max length (suggest 500 chars)

### Group / Recruiting
- Consider **not storing `members_wanted` as an independent field** —
  derive it as `max_members - current_member_count` instead. Storing it
  separately risks it drifting out of sync (e.g. leader sets "looking for
  2 more" then the group hits capacity through some other path, and the
  stored number is now wrong). This is a data-modeling suggestion, not
  just a validation rule.
- Cannot set `is_recruiting = true` if the group is already at `max_members`
- Cannot invite a user who is already a member
- Cannot invite a user with an existing pending `JoinRequest` — should
  surface as "Already invited" / "Already applied" state, not a silent
  duplicate
- Cannot invite a user who has blocked you or whom you've blocked
- **Leader-leaves edge case, undefined in the UI**: Edit Group has "Leave
  Group" available to any member including the leader, but there's no
  leadership-transfer flow. Needs a product decision: auto-promote the
  next member? Require the leader to explicitly transfer first? Force
  "End Project" if the leader tries to leave?

### Join Requests
- Cannot request to join your own group
- Cannot submit a second `JoinRequest` while one is already Pending for
  the same (applicant, group) pair — surface "Request Pending" state
  instead of the Request button (confirmed backend-only scope, but the
  *product* decision on whether reapplication is ever allowed after a
  Decline — and if so, after what cooldown — still needs an owner)
- Cannot request if `is_recruiting = false`
- Cannot request if the group is already at `max_members`

### Ratings
- Can only rate users who shared a group with you on a project that has
  `status = Ended`
- Cannot rate yourself
- One `Rating` per (rater, ratee, project) triple — decide whether it's
  editable after submission or locked permanently once submitted
- `stars` required (1–5); `comment` optional

### Report / Block
- Cannot report or block yourself
- Blocking should automatically: hide the blocked user's profile/content
  from the blocker, cancel any pending `JoinRequest` between the two
  users, and prevent new messages in either direction
- **Open question, not decided**: should blocking someone who's a current
  groupmate remove them from the shared group automatically, or should
  that stay a separate, deliberate leader action? Recommend the latter —
  auto-removal on block could be exploited to force someone out of a
  group without going through the leader.

### Privacy — a real logical inconsistency, flagging clearly
Create Project's Privacy step offers **Public** (everyone's Discover),
**Restricted** (only visible to people from the same school), and
**Invite-only**. But per the product overview, **Groovp is an SUTD-only
platform** — every user on the platform is already from the same school.
If that's still true, **"Restricted" and "Public" are functionally
identical**, and the tier is dead UI that will confuse users ("why did I
pick Restricted if everyone can already see it?").

Two ways to resolve this — needs a product decision, not a backend
guess:
1. **Groovp is actually multi-university** (not stated anywhere else in
   the file) — in which case "Restricted" is meaningful and `University`
   needs to be a real filterable field on both User and the visibility
   check, not just profile display text.
2. **Groovp is genuinely SUTD-only** — in which case "Restricted" should
   be removed from the Privacy step, or repurposed into something that's
   actually meaningful at SUTD scale (e.g. "Restricted to my course/
   major" instead of "my school").

### Popular / Latest / Recently Viewed sorting (Home)
Not specified anywhere in the design — needs definitions:
- **Latest**: straightforward, `created_at DESC`
- **Popular**: needs a defined metric — member-fill-rate? total saves?
  total join requests received? Recommend total `JoinRequest` count +
  `is_saved_by` count as a simple weighted score, but this is a product
  call
- **Recently Viewed**: needs a `ProjectView` log (user_id, project_id,
  viewed_at), deduped per user, capped at a reasonable N (suggest 10),
  most-recent-first

---

## 7. Screens still needing backend-independent product decisions (not blocking, but flag before building)

These came up as real ambiguities during the audit and weren't fully resolved — worth a product conversation before the backend team assumes an answer:

1. **Profile completeness formula** — "80% complete" is shown but no formula was specified. Needs defined weights (e.g. does adding 1 skill count the same as adding a bio? does a portfolio link matter more than filling in Year of Study?). Suggested starting point: weight core identity fields (name/photo/university/major/year) higher than optional extras (portfolio links), since the former directly affects match quality more.
2. ~~Resource files vs. resource link~~ — **resolved during this pass**: confirmed via direct Figma inspection that Create Project Step 2 has *both* an optional resource link field AND a genuine file upload (drag-and-drop, restricted to JPEG/PNG/PDF/MP4, 50MB max, per the UI copy itself). This is a real feature, not ambiguous — see the validation rules above.
3. **Account recovery beyond password reset** — flagged as backend-only scope by the product owner but no design or requirements exist yet for what happens if a student loses access to their university email entirely.
4. **Duplicate JoinRequest handling** — confirmed backend-only, but the *product* decision (silently block vs. show an error vs. allow after Decline) still needs to be made somewhere, even if not in the UI.
5. **Email domain restriction** — given this is described as an SUTD-specific platform, should signup enforce a university email domain (e.g. `@sutd.edu.sg`)? Not shown in the Figma (Email field has no visible domain hint/restriction), but relevant to both the "Restricted" privacy tier question above and general platform integrity (preventing non-students from signing up).
6. **Username/password rules** — Signup Step 1 has no visible password strength requirement or confirm-password field, and no stated username format rules (length, allowed characters, uniqueness enforcement point — client-side check on blur, or only on submit?). Needs a minimum spec before backend validation can be written; recommend at least: username 3–20 chars alphanumeric+underscore, password 8+ chars.
7. **Leader-leaves-group flow** — see Group/Recruiting validation rules above. Genuinely undesigned in the UI (Leave Group is available to leaders with no transfer step), needs a product decision, not just backend enforcement.

---

## 8. Decisions Made This Pass (no longer open questions)

1. **Restricted privacy = same-school-only, and this makes Groovp multi-university.** Confirmed: "Restricted" filters visibility to students from the *same school as the project*. This means `University` must be a real, verified field — not just profile display text — and email domain becomes the verification mechanism (see #2). Groovp is **not** SUTD-exclusive; it supports multiple universities, each scoped by their own email domain.
2. **Email domain restriction: yes, enforced at signup.** The signup email must match a recognized university domain (e.g. `@sutd.edu.sg`, `@nus.edu.sg`, etc.) — this is both how a user's `University` gets set/verified, and what makes the Restricted privacy tier meaningful rather than dead UI. Needs a maintained allowlist of valid domains → university mappings.
3. **Both project types can use any privacy tier.** Public/Restricted/Invite-only are available to Academic *and* Personal projects — the host chooses freely regardless of project type. No conditional logic needed based on `project.type`.
4. **Reapplication cooldown: 3 days.** After a `JoinRequest` is Declined, the same applicant cannot submit a new request to the same group until 3 days have passed. Store `declined_at` on the request and check `now() - declined_at >= 3 days` before allowing a new submission.
5. **Username/password: reasonable defaults confirmed.** Username 3–20 characters, alphanumeric + underscore only. Password minimum 8 characters. No additional complexity rules specified — don't over-engineer beyond this.
6. **Leader-leaves-group: no auto-promotion.** If the leader taps "Leave Group," they must be blocked from doing so directly — the UI should force them to choose one of: (a) transfer leadership to another member first, then leave, or (b) trigger "End Project" instead. **This needs a new confirmation/choice screen on Edit Group** that doesn't currently exist — flagging as a design gap, not just a backend rule.
7. **Account recovery beyond password reset: explicitly out of scope for v1.** Product owner's call — do not build this, do not flag it as a blocker.

## 9. New Screen Added This Pass: Edit Project

**Project host** (the creator/owner — a distinct role from Group leader,
since one Academic project can have multiple groups each with their own
leader, but only one host) can edit the project's own details, separate
from any individual group's settings.

- **Entry point**: an "✎ Edit" button on **Project Details**, host-only
  visibility (the viewer must be `project.owner_id === current_user.id`)
- **Fields** (combining Create Project's field set into one consolidated
  edit screen, styled to match Edit Group's visual language): photo
  (rounded-square), name, description, start/end dates, min/max team
  size, number of groups (Academic only), skills needed, interests
  needed, resource link, resource file, privacy (all 3 tiers, any
  project type)
- **Danger Zone**: "Delete Project" — **not yet defined**: does deleting
  a project cascade to delete all its Groups, remove all members, cancel
  all pending JoinRequests? Needs a decision before backend implements
  it; the Figma currently routes this to a simple confirmation-less
  action for prototype purposes only, not a real deletion flow.
