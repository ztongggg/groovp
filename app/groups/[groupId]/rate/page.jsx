import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import RateTeammatesList from "@/components/RateTeammatesList";
import { createClient } from "@/lib/supabase/server";

// Standalone Rate Teammates — reachable by ANY former member of an ended
// group (not leader-only like the End Project flow's version), e.g. from a
// rate_reminder notification.
async function getData(groupId) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: g } = await supabase.from("groups").select("id, name, project_id, status, projects(name)").eq("id", groupId).single();
    if (!g) return null;

    const { data: members } = await supabase.from("group_members").select("user_id, role, profiles(full_name, username, avatar_url)").eq("group_id", groupId);
    const wasMember = (members || []).some((m) => m.user_id === user.id);
    if (!wasMember) return null;

    return {
      group: g,
      members: (members || []).filter((m) => m.user_id !== user.id).map((m) => ({
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

export default async function RateTeammatesPage({ params }) {
  const data = await getData(params.groupId);

  if (!data || data.group.status !== "Ended") {
    return (
      <AppShell>
        <div className="min-h-full bg-white pt-24 text-center text-muted">
          {data ? "This project hasn't ended yet." : "Not available."}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-full pb-8" style={{ background: "#F9F8FB" }}>
        <StatusBar />
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 24px" }}>
          <Link href="/teams" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }}>‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1D1B44" }}>Rate your teammates</h1>
        </div>
        <p style={{ marginTop: 14, padding: "0 24px", fontSize: 12.5, color: "#757080", lineHeight: "18px" }}>
          &ldquo;{data.group.projects?.name || data.group.name}&rdquo; has ended. Leave a rating for each teammate.
        </p>

        <div style={{ marginTop: 24, padding: "0 24px" }}>
          <RateTeammatesList members={data.members} projectId={data.group.project_id} />
        </div>
      </div>
    </AppShell>
  );
}
