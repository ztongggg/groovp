import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import ApplicantCard from "@/components/ApplicantCard";
import { createClient } from "@/lib/supabase/server";
import { computeMatch } from "@/lib/matching";

async function getApplicants() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // groups I lead
    const { data: groups } = await supabase
      .from("groups")
      .select("id, name, skills_wanted, interests_wanted, personality_wanted, projects(name)")
      .eq("leader_id", user.id);
    if (!groups || groups.length === 0) return [];

    const groupIds = groups.map((g) => g.id);
    const byId = Object.fromEntries(groups.map((g) => [g.id, g]));

    const { data: reqs } = await supabase
      .from("join_requests")
      .select("id, group_id, user_id, status, comment, created_at, profiles:user_id(full_name, username, skills, interests, personality, prefer_working, best_work_time)")
      .in("group_id", groupIds)
      .order("created_at", { ascending: false });

    return (reqs || []).map((r) => {
      const group = byId[r.group_id];
      const match = computeMatch(r.profiles || {}, group || {});
      return {
        id: r.id,
        groupId: r.group_id,
        applicantId: r.user_id,
        status: r.status,
        name: r.profiles?.full_name || r.profiles?.username || "Someone",
        username: r.profiles?.username || "user",
        skills: r.profiles?.skills || [],
        comment: r.comment,
        group: group?.name || "Group",
        project: group?.projects?.name || "your project",
        isStrongMatch: match.isStrongMatch,
        matchedSkills: match.matchedSkills,
      };
    });
  } catch {
    return [];
  }
}

const HISTORY_STYLE = {
  accepted: { label: "Accepted", bg: "#d4f2de", color: "#298c52" },
  declined: { label: "Declined", bg: "#fae0e0", color: "#bf4247" },
  invited: { label: "Invited", bg: "#fce5b8", color: "#99730d" },
};

export default async function ApplicantsPage() {
  const all = await getApplicants();
  const pending = all.filter((a) => a.status === "pending");
  const invited = all.filter((a) => a.status === "invited");
  const history = all.filter((a) => a.status === "accepted" || a.status === "declined");

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/home" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Requests</h1>
        </div>

        {all.length === 0 ? (
          <div className="mt-24 px-8 text-center">
            <p className="text-[16px] font-semibold text-navy">No requests yet</p>
            <p className="mt-1 text-[14px] text-muted">When people ask to join your projects, they show up here.</p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-4 px-6">
            {pending.length > 0 && <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Pending · {pending.length}</p>}
            {pending.map((a) => (
              <ApplicantCard key={a.id} {...a} queueIds={pending.filter((p) => p.groupId === a.groupId).map((p) => p.applicantId)} />
            ))}

            {invited.length > 0 && (
              <>
                <p className="mt-2 text-[12px] font-bold uppercase tracking-wide text-muted">Invited · {invited.length}</p>
                {invited.map((a) => {
                  const s = HISTORY_STYLE.invited;
                  return (
                    <Link key={a.id} href={`/u/${a.applicantId}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: "#7c3aed" }}>{(a.name || "?").slice(0, 2).toUpperCase()}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold text-navy">{a.name}</p>
                        <p className="truncate text-[12px] text-muted">{a.project}</p>
                      </div>
                      <span className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </Link>
                  );
                })}
              </>
            )}

            {history.length > 0 && (
              <>
                <p className="mt-2 text-[12px] font-bold uppercase tracking-wide text-muted">History</p>
                {history.map((a) => {
                  const s = HISTORY_STYLE[a.status] || HISTORY_STYLE.declined;
                  return (
                    <Link key={a.id} href={`/u/${a.applicantId}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: "#7c3aed" }}>{(a.name || "?").slice(0, 2).toUpperCase()}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold text-navy">{a.name}</p>
                        <p className="truncate text-[12px] text-muted">{a.project}</p>
                      </div>
                      <span className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
