import AppShell from "@/components/AppShell";
import UserProfileView from "@/components/UserProfileView";
import ModerationMenu from "@/components/ModerationMenu";
import MessageButton from "@/components/MessageButton";
import ApplicantReviewBar from "@/components/ApplicantReviewBar";
import { createClient } from "@/lib/supabase/server";
import { computeMatch } from "@/lib/matching";
import { getExperimentCondition } from "@/lib/experiment"; // EXPERIMENT: see lib/experiment.js

async function getData(id, groupId, includePersonality) {
  const empty = { me: null, p: null, ratings: [], blocked: false, match: null, pendingRequestId: null, pastProjects: [], skillList: [] };
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: p } = await supabase.from("profiles").select("*").eq("id", id).single();
    const { data: ratings } = await supabase.from("ratings").select("stars").eq("ratee_id", id);

    // Proficiency badges come from user_skills; profiles.skills is the plain
    // fallback for accounts created before that table existed.
    let skillList = (p?.skills || []).map((n) => ({ name: n, level: null }));
    try {
      const { data: us } = await supabase.from("user_skills").select("skill_name, proficiency").eq("user_id", id);
      if (us?.length) skillList = us.map((r) => ({ name: r.skill_name, level: r.proficiency }));
    } catch {}

    let blocked = false;
    if (user) {
      try {
        const { data: b } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", user.id).eq("blocked_id", id).maybeSingle();
        blocked = !!b;
      } catch {}
    }

    // Reviewing an applicant against a specific group (from Requests) — compute the
    // Strong Match / highlighted-attributes state (spec §5), only when groupId is passed.
    let match = null;
    let pendingRequestId = null;
    if (groupId) {
      try {
        const { data: g } = await supabase.from("groups").select("skills_wanted, interests_wanted, personality_wanted, leader_id").eq("id", groupId).single();
        if (g) match = computeMatch(p || {}, g, { includePersonality });
        if (g && user && g.leader_id === user.id) {
          const { data: jr } = await supabase.from("join_requests").select("id").eq("group_id", groupId).eq("user_id", id).eq("status", "pending").maybeSingle();
          pendingRequestId = jr?.id || null;
        }
      } catch {}
    }

    // Project tab.
    let pastProjects = [];
    try {
      const { data: pp } = await supabase.from("past_projects").select("id, role, write_up, photos, created_at, project_id").eq("user_id", id).order("created_at", { ascending: false });
      const projIds = (pp || []).map((r) => r.project_id).filter(Boolean);
      let projById = {};
      if (projIds.length) {
        const { data: projs } = await supabase.from("projects").select("id, name, timeline_start, timeline_end").in("id", projIds);
        projById = Object.fromEntries((projs || []).map((r) => [r.id, r]));
      }
      pastProjects = (pp || []).map((r) => ({ ...r, project: r.project_id ? projById[r.project_id] : null }));
    } catch {}

    return { me: user?.id || null, p, ratings: ratings || [], blocked, match, pendingRequestId, pastProjects, skillList };
  } catch {
    return empty;
  }
}

export default async function UserProfilePage({ params, searchParams }) {
  const condition = await getExperimentCondition(); // EXPERIMENT: see lib/experiment.js
  const isNeutral = condition === "neutral";
  const { me, p, ratings, blocked, match, pendingRequestId, pastProjects, skillList } = await getData(params.id, searchParams?.groupId, !isNeutral);
  const groupId = searchParams?.groupId;
  const queue = searchParams?.queue ? searchParams.queue.split(",").filter(Boolean) : [];
  const queueIndex = queue.indexOf(params.id);
  const showPaging = queue.length > 1 && queueIndex !== -1;
  const pagingHref = (i) => `/u/${queue[i]}?groupId=${groupId}&queue=${queue.join(",")}`;

  if (!p) {
    return (
      <AppShell>
        <div className="min-h-full bg-white pt-24 text-center text-muted">User not found.</div>
      </AppShell>
    );
  }

  const name = p.full_name || p.username || "Student";
  const subtitle = [p.year, p.major, p.university || "SUTD"].filter(Boolean).join(" · ");
  const ratingsHidden = !(me === p.id || p.show_ratings_publicly !== false);
  const count = ratingsHidden ? 0 : ratings.length;
  const avg = count ? (ratings.reduce((s, r) => s + r.stars, 0) / count).toFixed(1) : null;

  return (
    <AppShell>
      <UserProfileView
        profile={{ ...p, skillList }}
        subtitle={subtitle}
        ratingLabel={avg || "New"}
        ratingCount={count}
        ratingsHidden={ratingsHidden}
        pastProjects={pastProjects}
        match={match}
        blocked={blocked}
        backHref={groupId ? "/applicants" : "/discover"}
        hidePersonality={isNeutral}
        paging={
          showPaging
            ? {
                index: queueIndex,
                total: queue.length,
                prevHref: queueIndex > 0 ? pagingHref(queueIndex - 1) : null,
                nextHref: queueIndex < queue.length - 1 ? pagingHref(queueIndex + 1) : null,
              }
            : null
        }
        moderationMenu={me && me !== p.id ? <ModerationMenu userId={p.id} name={name} blocked={blocked} /> : null}
        messageButton={me && me !== p.id && !blocked ? <MessageButton userId={p.id} /> : null}
        reviewBar={
          pendingRequestId ? (
            <ApplicantReviewBar
              requestId={pendingRequestId}
              groupId={groupId}
              applicantId={p.id}
              prevHref={showPaging && queueIndex > 0 ? pagingHref(queueIndex - 1) : null}
              nextHref={showPaging && queueIndex < queue.length - 1 ? pagingHref(queueIndex + 1) : null}
            />
          ) : null
        }
      />
    </AppShell>
  );
}
