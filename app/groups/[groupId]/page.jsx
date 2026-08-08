import Link from "next/link";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import LeaveGroupButton from "@/components/LeaveGroupButton";
import JoinGroupButton from "@/components/JoinGroupButton";
import GroupRequestRow from "@/components/GroupRequestRow";
import BackButton from "@/components/BackButton";
import { computeMatch, STRONG_MATCH_THRESHOLD } from "@/lib/matching";
import { markTaskStart, getExperimentCondition } from "@/lib/experiment"; // EXPERIMENT: see lib/experiment.js

async function getData(groupId, includePersonality) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: g } = await supabase
      .from("groups")
      .select("id, name, photo_url, leader_id, project_id, recruiting, members_wanted, skills_wanted, personality_wanted, interests_wanted, additional_notes, max_members, status")
      .eq("id", groupId)
      .single();
    if (!g) return null;

    const { data: members } = await supabase.from("group_members").select("user_id, role, profiles(full_name, username, avatar_url)").eq("group_id", groupId);

    // Parent-project summary card.
    const { data: project } = g.project_id
      ? await supabase.from("projects").select("id, name, course_code, timeline_start, timeline_end").eq("id", g.project_id).single()
      : { data: null };

    const isLeader = user && g.leader_id === user.id;
    const isMember = user && (members || []).some((m) => m.user_id === user.id);

    // Pending requests are listed inline for the leader, with Accept/Decline.
    let requests = [];
    if (isLeader) {
      const { data: jrs } = await supabase.from("join_requests").select("id, user_id, created_at").eq("group_id", groupId).eq("status", "pending").order("created_at", { ascending: true });
      const ids = (jrs || []).map((r) => r.user_id);
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name, username, avatar_url, year, major, skills, interests, personality, prefer_working, best_work_time, location").in("id", ids);
        const byId = Object.fromEntries((profs || []).map((p) => [p.id, p]));
        requests = (jrs || []).map((r) => {
          const p = byId[r.user_id] || {};
          const m = computeMatch(p, g, { includePersonality });
          return {
            id: r.id,
            userId: r.user_id,
            name: p.full_name || p.username || "Someone",
            avatarUrl: p.avatar_url || "",
            subtitle: [p.year, p.major].filter(Boolean).join(" · ") || (p.username ? `@${p.username}` : ""),
            strongMatch: m.overlapCount >= STRONG_MATCH_THRESHOLD,
          };
        });
      }
    }

    // Group Info - Request Others: a non-member viewer sees their own match
    // score against this group's wanted criteria (User↔Group direction).
    let match = null;
    if (user && !isMember && !isLeader) {
      const { data: viewer } = await supabase.from("profiles").select("skills, interests, personality, prefer_working, best_work_time").eq("id", user.id).maybeSingle();
      if (viewer) match = computeMatch(viewer, g, { includePersonality });
    }

    return {
      group: g,
      project,
      isLeader,
      isMember,
      match,
      requests,
      meId: user?.id || null,
      members: (members || []).map((m) => ({
        userId: m.user_id,
        role: m.role,
        name: m.profiles?.full_name || m.profiles?.username || "Someone",
        avatarUrl: m.profiles?.avatar_url || "",
      })),
    };
  } catch {
    return null;
  }
}

const AVATAR = ["#FBBF24", "#F2A5BD", "#4AC7B2", "#A78BFA", "#FF8671"];
const LABEL = { fontSize: 12, fontWeight: 700, color: "#757080" };

function FaceTile({ url, colour, size = 44 }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" style={{ width: size, height: size, borderRadius: 9999, objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <span style={{ position: "relative", width: size, height: size, borderRadius: 9999, background: colour, display: "block", flexShrink: 0 }}>
      <span style={{ position: "absolute", left: 8, top: 17, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: 30, top: 17, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: 16, top: 26, width: 12, height: 3, borderRadius: 9999, background: "#fff" }} />
    </span>
  );
}

function WantedChips({ label, items = [], matched = [], labelColour }) {
  if (!items.length) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <p style={{ fontSize: 9.5, fontWeight: 700, color: labelColour }}>{label}</p>
      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((s) => {
          const hit = matched.some((m) => String(m).toLowerCase() === String(s).toLowerCase());
          return (
            <span key={s} style={{ height: 24, borderRadius: 12, background: "#fff", padding: "0 9px", display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 600, color: hit ? "#298C52" : "#1D1B44", border: hit ? "1px solid #298C52" : "none" }}>{s}</span>
          );
        })}
      </div>
    </div>
  );
}

function shortDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// Read-only Group Info (Figma: Recruiting On / Recruiting Off / Request Others).
// Every member sees this; Edit Group and Recruiting Settings are leader-only
// actions reached from here, not the entry point itself.
export default async function GroupInfoPage({ params }) {
  const condition = await getExperimentCondition(); // EXPERIMENT: see lib/experiment.js
  const isNeutral = condition === "neutral";
  const data = await getData(params.groupId, !isNeutral);

  if (!data) {
    return (
      <AppShell>
        <div className="min-h-full bg-white pt-24 text-center text-muted">Group not found.</div>
      </AppShell>
    );
  }

  const { group, project, isLeader, isMember, match, requests, meId, members } = data;
  if (isLeader && requests.length > 0) await markTaskStart(4); // EXPERIMENT: no-op for real users
  const recruiting = group.recruiting !== false && group.status !== "Ended";
  const insider = isLeader || isMember;
  const projectMeta = [project?.course_code, [shortDate(project?.timeline_start), shortDate(project?.timeline_end) || "Present"].filter(Boolean).join(" - ")].filter(Boolean).join(" · ");

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-10">

        <div style={{ position: "relative", height: 42 }}>
          <BackButton
            fallbackHref={isMember ? `/chat/${group.id}` : group.project_id ? `/project/${group.project_id}` : "/discover"}
            style={{ position: "absolute", left: 24, top: 0, width: 40, height: 40, borderRadius: 9999, background: "#F3F1F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }}
          />
          {isLeader && (
            <Link href={`/groups/${group.id}/edit`} aria-label="Edit group" style={{ position: "absolute", left: 338, top: -2, width: 40, height: 40, borderRadius: 9999, background: "#F3F1F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D1B44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" /></svg>
            </Link>
          )}
        </div>

        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {group.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={group.photo_url} alt="" style={{ width: 90, height: 90, borderRadius: 28.8, objectFit: "cover" }} />
          ) : (
            <div style={{ position: "relative", width: 90, height: 90, borderRadius: 28.8, background: "#4AC7B2" }}>
              <span style={{ position: "absolute", left: 16.2, top: 32.4, width: 12.3, height: 12.3, borderRadius: 9999, background: "#fff" }} />
              <span style={{ position: "absolute", left: 61.2, top: 32.4, width: 12.3, height: 12.3, borderRadius: 9999, background: "#fff" }} />
              <span style={{ position: "absolute", left: 32.6, top: 50.8, width: 24.6, height: 6.1, borderRadius: 9999, background: "#fff" }} />
            </div>
          )}
          <p style={{ marginTop: 20, fontSize: 20, fontWeight: 800, color: "#1D1B44" }}>{group.name}</p>
          <p style={{ marginTop: 8, fontSize: 12, color: "#757080" }}>
            {group.status === "Ended" ? "Project ended" : `${members.length} member${members.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div style={{ padding: "0 22px" }}>
          {project && (
            <>
              <p style={{ ...LABEL, marginTop: 33 }}>Project</p>
              <div style={{ marginTop: 10, background: "#F3F1F8", borderRadius: 16, padding: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1D1B44" }}>{project.name}</p>
                {projectMeta && <p style={{ marginTop: 8, fontSize: 11, color: "#59408C" }}>{projectMeta}</p>}
                <Link href={`/project/${project.id}`} style={{ display: "inline-block", marginTop: 8, fontSize: 11.5, fontWeight: 600, color: "#6126CC" }}>View full project details ›</Link>
              </div>
            </>
          )}

          <p style={{ ...LABEL, marginTop: 22 }}>Members ({members.length}/{group.max_members || "–"})</p>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {members.map((m, i) => (
              <Link key={m.userId} href={`/u/${m.userId}`} style={{ height: 60, background: "#F3F1F8", borderRadius: 14, display: "flex", alignItems: "center", gap: 12, padding: "0 8px" }}>
                <FaceTile url={m.avatarUrl} colour={AVATAR[i % AVATAR.length]} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>{m.name}{m.userId === meId ? " (You)" : ""}</span>
                  <span style={{ display: "block", fontSize: 11, color: "#757080", marginTop: 3 }}>{m.role === "leader" ? "Group Leader" : "Member"}</span>
                </span>
              </Link>
            ))}
          </div>

          {isLeader && (
            <Link href={`/groups/${group.id}/invite`} style={{ marginTop: 8, height: 48, background: "#F3F1F8", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>+ Invite members</Link>
          )}

          {isLeader && (
            <>
              <div style={{ marginTop: 25, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={LABEL}>{recruiting ? "Join Requests" : "Request History"}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#757080" }}>{requests.length} pending</p>
              </div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {requests.length === 0 ? (
                  <p style={{ fontSize: 12, color: "#757080" }}>No one is waiting right now.</p>
                ) : (
                  requests.map((r, i) => <GroupRequestRow key={r.id} request={r} groupId={group.id} index={i} />)
                )}
              </div>
              <Link href="/applicants" style={{ marginTop: 14, height: 44, background: "#F3F1F8", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 600, color: "#1D1B44" }}>View all requests ›</Link>
            </>
          )}

          {group.status !== "Ended" && (
            <>
              <p style={{ ...LABEL, marginTop: 25 }}>Recruiting</p>
              <div style={{ marginTop: 10, background: recruiting && isLeader ? "#ECE8FC" : "#F3F1F8", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "#1D1B44" }}>Open to join requests</p>
                    <p style={{ marginTop: 6, fontSize: 10.5, color: recruiting ? "#59408C" : "#757080" }}>
                      {recruiting ? "Anyone can request to join this group" : "No one can request to join right now"}
                    </p>
                  </div>
                  {isLeader && <Link href={`/recruiting/${group.id}`} style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: "#7C3AED" }}>Manage ›</Link>}
                </div>

                {recruiting && group.additional_notes && (
                  <div style={{ marginTop: 14, background: "#fff", borderRadius: 14, padding: "11px 16px" }}>
                    <p className="font-nunito" style={{ fontSize: 13, fontWeight: 600, color: "#1E1B4B" }}>&ldquo;{group.additional_notes}&rdquo;</p>
                  </div>
                )}

                {recruiting && (
                  <>
                    <WantedChips label="SKILLS WANTED" items={group.skills_wanted} matched={match?.matchedSkills || []} labelColour={insider ? "#6126CC" : "#757080"} />
                    {/* EXPERIMENT: hidden entirely for a Neutral (B) viewer, even
                        on a seeded group they don't own — see lib/experiment.js */}
                    {!isNeutral && <WantedChips label="PERSONALITY WANTED" items={group.personality_wanted} matched={match?.matchedPersonality || []} labelColour={insider ? "#6126CC" : "#757080"} />}
                    <WantedChips label="INTERESTS WANTED" items={group.interests_wanted} matched={match?.matchedInterests || []} labelColour={insider ? "#6126CC" : "#757080"} />
                  </>
                )}
              </div>
            </>
          )}

          {match && (
            <div style={{ marginTop: 16, borderRadius: 16, padding: 14, background: match.isStrongMatch ? "#F5F0FF" : "#F9F8FB", border: match.isStrongMatch ? "1px solid #7C3AED" : "1px solid #EDE9FE" }}>
              {match.isStrongMatch ? (
                <p style={{ fontSize: 12.5, fontWeight: 700, color: "#7C3AED" }}>✨ Strong Match — you overlap on {match.overlapCount} thing{match.overlapCount === 1 ? "" : "s"} they&apos;re looking for.</p>
              ) : match.overlapCount > 0 ? (
                <p style={{ fontSize: 12.5, fontWeight: 600, color: "#1D1B44" }}>You share {match.overlapCount} thing{match.overlapCount === 1 ? "" : "s"} with what this group wants — matching items are highlighted above.</p>
              ) : (
                <p style={{ fontSize: 12.5, color: "#757080" }}>No overlap yet with what this group is looking for — you can still request to join.</p>
              )}
            </div>
          )}

          {isMember && !isLeader && (
            <div style={{ marginTop: 24 }}>
              <LeaveGroupButton groupId={group.id} />
            </div>
          )}

          {!isMember && !isLeader && recruiting && (
            <div style={{ marginTop: 24 }}>
              <JoinGroupButton groupId={group.id} full={members.length >= (group.max_members || 99)} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
