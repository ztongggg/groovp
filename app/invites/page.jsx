import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import InviteCard from "@/components/InviteCard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getInvites() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: reqs } = await supabase
      .from("join_requests")
      .select("id, group_id, created_at")
      .eq("user_id", user.id)
      .eq("status", "invited")
      .order("created_at", { ascending: false });
    const rows = reqs || [];
    if (!rows.length) return [];

    // Separate queries (nested embeds return null on Vercel).
    const groupIds = [...new Set(rows.map((r) => r.group_id))];
    const { data: groups } = await supabase
      .from("groups")
      .select("id, name, project_id, leader_id")
      .in("id", groupIds);
    const gById = Object.fromEntries((groups || []).map((g) => [g.id, g]));

    const projIds = [...new Set((groups || []).map((g) => g.project_id).filter(Boolean))];
    const leaderIds = [...new Set((groups || []).map((g) => g.leader_id).filter(Boolean))];
    const { data: projs } = projIds.length
      ? await supabase.from("projects").select("id, name").in("id", projIds)
      : { data: [] };
    const { data: leaders } = leaderIds.length
      ? await supabase.from("profiles").select("id, full_name, username").in("id", leaderIds)
      : { data: [] };
    const pById = Object.fromEntries((projs || []).map((p) => [p.id, p]));
    const lById = Object.fromEntries((leaders || []).map((l) => [l.id, l]));

    return rows.map((r) => {
      const g = gById[r.group_id] || {};
      const proj = pById[g.project_id];
      const leader = lById[g.leader_id];
      return {
        id: r.id,
        title: proj?.name || g.name || "A project",
        inviter: leader?.full_name || leader?.username || "the leader",
      };
    });
  } catch {
    return [];
  }
}

export default async function InvitesPage() {
  const invites = await getInvites();

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/home" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Invites</h1>
        </div>

        {invites.length === 0 ? (
          <div className="mt-24 px-8 text-center">
            <p className="text-[16px] font-semibold text-navy">No invites right now</p>
            <p className="mt-1 text-[14px] text-muted">When a leader invites you to a project, it shows up here.</p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3 px-5">
            {invites.map((inv) => (
              <InviteCard key={inv.id} invite={inv} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
