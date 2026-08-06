import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import { createClient } from "@/lib/supabase/server";
import LeaveGroupButton from "@/components/LeaveGroupButton";
import JoinGroupButton from "@/components/JoinGroupButton";
import { computeMatch } from "@/lib/matching";

async function getData(groupId) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: g } = await supabase
      .from("groups")
      .select("id, name, photo_url, leader_id, project_id, recruiting, members_wanted, skills_wanted, personality_wanted, interests_wanted, additional_notes, max_members, status")
      .eq("id", groupId)
      .single();
    if (!g) return null;

    const { data: members } = await supabase.from("group_members").select("user_id, role, profiles(full_name, username)").eq("group_id", groupId);

    let pendingCount = 0;
    const isLeader = user && g.leader_id === user.id;
    if (isLeader) {
      const { count } = await supabase.from("join_requests").select("id", { count: "exact", head: true }).eq("group_id", groupId).eq("status", "pending");
      pendingCount = count || 0;
    }

    const isMember = user && (members || []).some((m) => m.user_id === user.id);

    // Group Info - Request Others: a non-member viewer sees their own match
    // score against this group's wanted criteria (User↔Group direction).
    let match = null;
    if (user && !isMember && !isLeader) {
      const { data: viewer } = await supabase.from("profiles").select("skills, interests, personality, prefer_working, best_work_time").eq("id", user.id).maybeSingle();
      if (viewer) match = computeMatch(viewer, g);
    }

    return {
      group: g,
      isLeader,
      isMember,
      match,
      pendingCount,
      meId: user?.id || null,
      members: (members || []).map((m) => ({
        userId: m.user_id,
        role: m.role,
        name: m.profiles?.full_name || m.profiles?.username || "Someone",
      })),
    };
  } catch {
    return null;
  }
}

const AVATAR = ["#e8863b", "#34b9a8", "#f2a5bd", "#7c3aed", "#4ac7b2"];

// Read-only "Group Info" overview (Figma: Group Info - Recruiting On/Off) — every
// member sees this; Edit Group / Recruiting Settings are leader-only actions reached
// from here, not the entry point itself.
export default async function GroupInfoPage({ params }) {
  const data = await getData(params.groupId);

  if (!data) {
    return (
      <AppShell>
        <div className="min-h-full bg-white pt-24 text-center text-muted">Group not found.</div>
      </AppShell>
    );
  }

  const { group, isLeader, isMember, match, pendingCount, meId, members } = data;
  const recruiting = group.recruiting !== false && group.status !== "Ended";

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href={isMember ? `/chat/${group.id}` : group.project_id ? `/project/${group.project_id}` : "/discover"} className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Group Info</h1>
        </div>

        <div className="mt-5 flex flex-col items-center px-6">
          {group.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={group.photo_url} alt="" className="object-cover" style={{ width: 90, height: 90, borderRadius: 29 }} />
          ) : (
            <div style={{ width: 90, height: 90, borderRadius: 29, background: "#4ac7b2" }} />
          )}
          <p className="mt-3 text-[19px] font-extrabold text-navy">{group.name}</p>
          <p className="mt-1 text-[12.5px] font-semibold" style={{ color: recruiting ? "#298c52" : "#9ca3af" }}>
            {group.status === "Ended" ? "Project ended" : recruiting ? "Open to join requests" : "Not recruiting"}
          </p>
        </div>

        <div className="mt-6 px-6">
          <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">Members ({members.length}/{group.max_members || "–"})</p>
          <div className="flex flex-col gap-2">
            {members.map((m, i) => (
              <Link key={m.userId} href={`/u/${m.userId}`} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "#f9f8fb" }}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: AVATAR[i % AVATAR.length] }}>
                  {(m.name || "?").slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <p className="text-[14px] font-semibold text-navy">{m.name}{m.userId === meId ? " (You)" : ""}</p>
                  <p className="text-[12px] text-muted">{m.role === "leader" ? "Group Leader" : "Member"}</p>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {match && (
          <div className="mt-6 px-6">
            <div className="rounded-2xl p-4" style={{ background: match.isStrongMatch ? "#f5f0ff" : "#f9f8fb", border: match.isStrongMatch ? "1px solid #7c3aed" : "1px solid #eee" }}>
              {match.isStrongMatch ? (
                <p className="text-[13.5px] font-bold text-purple-600">✨ Strong Match — you overlap on {match.overlapCount} thing{match.overlapCount === 1 ? "" : "s"} they're looking for.</p>
              ) : match.overlapCount > 0 ? (
                <p className="text-[13.5px] font-semibold text-navy">You share {match.overlapCount} thing{match.overlapCount === 1 ? "" : "s"} with what this group wants — matching items are highlighted below.</p>
              ) : (
                <p className="text-[13.5px] text-muted">No overlap yet with what this group is looking for — you can still request to join.</p>
              )}
            </div>
          </div>
        )}

        {recruiting && (
          <div className="mt-6 flex flex-col gap-4 px-6">
            {group.members_wanted > 0 && (
              <p className="text-[13px] font-semibold text-navy">Looking for {group.members_wanted} more member{group.members_wanted === 1 ? "" : "s"}</p>
            )}
            {group.skills_wanted?.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Skills wanted</p>
                <div className="flex flex-wrap gap-2">{group.skills_wanted.map((s) => {
                  const matched = match?.matchedSkills?.some((m) => m.toLowerCase() === s.toLowerCase());
                  return <span key={s} className="rounded-full px-3 py-1.5 text-[12px] font-semibold" style={matched ? { background: "#d4f2de", color: "#298c52", border: "1px solid #298c52" } : { background: "#f5f0ff", color: "#7c3aed" }}>{s}</span>;
                })}</div>
              </div>
            )}
            {group.personality_wanted?.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Personality wanted</p>
                <div className="flex flex-wrap gap-2">{group.personality_wanted.map((s) => {
                  const matched = match?.matchedPersonality?.some((m) => m.toLowerCase() === s.toLowerCase());
                  return <span key={s} className="rounded-full px-3 py-1.5 text-[12px] font-semibold" style={matched ? { background: "#d4f2de", color: "#298c52", border: "1px solid #298c52" } : { background: "#f0eef5", color: "#1e1b4b" }}>{s}</span>;
                })}</div>
              </div>
            )}
            {group.interests_wanted?.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Interests wanted</p>
                <div className="flex flex-wrap gap-2">{group.interests_wanted.map((s) => {
                  const matched = match?.matchedInterests?.some((m) => m.toLowerCase() === s.toLowerCase());
                  return <span key={s} className="rounded-full px-3 py-1.5 text-[12px] font-semibold" style={matched ? { background: "#d4f2de", color: "#298c52", border: "1px solid #298c52" } : { background: "#f5f0ff", color: "#7c3aed" }}>{s}</span>;
                })}</div>
              </div>
            )}
            {group.additional_notes && (
              <div className="rounded-2xl bg-[#f9f7ff] p-4">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted">Notes</p>
                <p className="text-[13.5px] text-navy">{group.additional_notes}</p>
              </div>
            )}
          </div>
        )}

        {isLeader && (
          <div className="mt-6 flex flex-col gap-3 px-6">
            {pendingCount > 0 && (
              <Link href="/applicants" className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3.5">
                <span className="text-[14px] font-semibold text-navy">{pendingCount} pending request{pendingCount === 1 ? "" : "s"}</span>
                <span className="text-[16px] text-muted">›</span>
              </Link>
            )}
            <Link href={`/recruiting/${group.id}`} className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3.5">
              <span className="text-[14px] font-semibold text-navy">Recruiting settings</span>
              <span className="text-[16px] text-muted">›</span>
            </Link>
            <Link href={`/groups/${group.id}/edit`} className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3.5">
              <span className="text-[14px] font-semibold text-navy">Edit group</span>
              <span className="text-[16px] text-muted">›</span>
            </Link>
          </div>
        )}

        {isMember && !isLeader && (
          <div className="mt-6 px-6">
            <LeaveGroupButton groupId={group.id} />
          </div>
        )}

        {!isMember && !isLeader && recruiting && (
          <div className="mt-6 px-6">
            <JoinGroupButton groupId={group.id} full={members.length >= (group.max_members || 99)} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
