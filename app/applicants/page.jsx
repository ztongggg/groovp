import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import ApplicantCard, { ApplicantFace, StrongMatchPill, CARD_STYLE, appliedLabel } from "@/components/ApplicantCard";
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
      .select("id, group_id, user_id, status, comment, created_at, profiles:user_id(full_name, username, avatar_url, year, major, skills, interests, personality, prefer_working, best_work_time)")
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
        avatarUrl: r.profiles?.avatar_url || "",
        subtitle: [r.profiles?.year, r.profiles?.major].filter(Boolean).join(" · "),
        createdAt: r.created_at,
        comment: r.comment,
        group: group?.name || "Group",
        project: group?.projects?.name || "your project",
        isStrongMatch: match.isStrongMatch,
      };
    });
  } catch {
    return [];
  }
}

const HISTORY_STYLE = {
  accepted: { label: "Accepted", bg: "#D4F2DE", color: "#298C52" },
  declined: { label: "Declined", bg: "#FAE0E0", color: "#BF4247" },
  invited: { label: "Invited", bg: "#FCE5B8", color: "#99730D" },
};

const SECTION = { fontSize: 12, fontWeight: 700, color: "#757080" };

/** A settled request — same card, a status pill instead of the two actions. */
function HistoryRow({ a, index }) {
  const s = HISTORY_STYLE[a.status] || HISTORY_STYLE.declined;
  return (
    <Link href={`/u/${a.applicantId}`} style={{ ...CARD_STYLE, display: "flex", alignItems: "center", gap: 10 }}>
      <ApplicantFace url={a.avatarUrl} index={index} />
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1D1B44", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
          {a.isStrongMatch && <StrongMatchPill />}
        </span>
        <span style={{ fontSize: 10.5, color: "#757080", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.subtitle || `@${a.username}`}</span>
        <span style={{ fontSize: 10, color: "#757080" }}>{appliedLabel(a.createdAt)}</span>
      </span>
      <span style={{ minWidth: 80, height: 26, borderRadius: 13, background: s.bg, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
      </span>
    </Link>
  );
}

export default async function ApplicantsPage() {
  const all = await getApplicants();
  const pending = all.filter((a) => a.status === "pending");
  const invited = all.filter((a) => a.status === "invited");
  const history = all.filter((a) => a.status === "accepted" || a.status === "declined");

  return (
    <AppShell>
      <div className="min-h-full pb-8" style={{ background: "#F9F8FB" }}>
        <StatusBar />
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 24px" }}>
          <Link href="/home" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }}>‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1D1B44" }}>Request History</h1>
        </div>

        {all.length === 0 ? (
          <div style={{ marginTop: 96, padding: "0 32px", textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1D1B44" }}>No requests yet</p>
            <p style={{ marginTop: 8, fontSize: 13, color: "#757080" }}>When people ask to join your projects, they show up here.</p>
          </div>
        ) : (
          <div style={{ marginTop: 22, padding: "0 22px", display: "flex", flexDirection: "column", gap: 15 }}>
            {pending.map((a, i) => (
              <ApplicantCard key={a.id} {...a} index={i} queueIds={pending.filter((p) => p.groupId === a.groupId).map((p) => p.applicantId)} />
            ))}

            {invited.length > 0 && (
              <>
                <p style={SECTION}>Invited</p>
                {invited.map((a, i) => <HistoryRow key={a.id} a={a} index={i} />)}
              </>
            )}

            {history.length > 0 && (
              <>
                <p style={SECTION}>History</p>
                {history.map((a, i) => <HistoryRow key={a.id} a={a} index={i} />)}
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
