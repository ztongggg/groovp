import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import { createClient } from "@/lib/supabase/server";
import LeaveGroupButton from "@/components/LeaveGroupButton";
import JoinGroupButton from "@/components/JoinGroupButton";

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

    return {
      group: g,
      isLeader,
      isMember,
      pendingCount,
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

  const { group, isLeader, isMember, pendingCount, members } = data;
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
          <div className="flex -space-x-2">
            {members.slice(0, 6).map((m, i) => (
              <Link key={m.userId} href={`/u/${m.userId}`} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-[12px] font-bold text-white" style={{ background: AVATAR[i % AVATAR.length] }}>
                {(m.name || "?").slice(0, 2).toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        {recruiting && (
          <div className="mt-6 flex flex-col gap-4 px-6">
            {group.members_wanted > 0 && (
              <p className="text-[13px] font-semibold text-navy">Looking for {group.members_wanted} more member{group.members_wanted === 1 ? "" : "s"}</p>
            )}
            {group.skills_wanted?.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Skills wanted</p>
                <div className="flex flex-wrap gap-2">{group.skills_wanted.map((s) => <span key={s} className="rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: "#f5f0ff", color: "#7c3aed" }}>{s}</span>)}</div>
              </div>
            )}
            {group.personality_wanted?.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Personality wanted</p>
                <div className="flex flex-wrap gap-2">{group.personality_wanted.map((s) => <span key={s} className="rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: "#f0eef5", color: "#1e1b4b" }}>{s}</span>)}</div>
              </div>
            )}
            {group.interests_wanted?.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Interests wanted</p>
                <div className="flex flex-wrap gap-2">{group.interests_wanted.map((s) => <span key={s} className="rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: "#f5f0ff", color: "#7c3aed" }}>{s}</span>)}</div>
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
