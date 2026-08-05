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

    const { data: members } = await supabase.from("group_members").select("user_id, profiles(full_name, username)").eq("group_id", groupId);
    const wasMember = (members || []).some((m) => m.user_id === user.id);
    if (!wasMember) return null;

    return {
      group: g,
      members: (members || []).filter((m) => m.user_id !== user.id).map((m) => ({ userId: m.user_id, name: m.profiles?.full_name || m.profiles?.username || "Someone" })),
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
      <div className="min-h-full bg-white pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/teams" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Rate Teammates</h1>
        </div>
        <p className="mt-1 px-6 text-[13px] text-muted">{data.group.projects?.name || data.group.name}</p>

        <div className="mt-5 px-6">
          <RateTeammatesList members={data.members} projectId={data.group.project_id} />
        </div>
      </div>
    </AppShell>
  );
}
