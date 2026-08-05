import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import EndProjectFlow from "@/components/EndProjectFlow";
import { createClient } from "@/lib/supabase/server";

async function getData(groupId) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: g } = await supabase.from("groups").select("id, name, leader_id, project_id, status").eq("id", groupId).single();
    if (!g || g.leader_id !== user.id) return null;

    const { data: members } = await supabase.from("group_members").select("user_id, profiles(full_name, username)").eq("group_id", groupId).neq("user_id", user.id);

    return {
      group: g,
      members: (members || []).map((m) => ({ userId: m.user_id, name: m.profiles?.full_name || m.profiles?.username || "Someone" })),
    };
  } catch {
    return null;
  }
}

export default async function EndProjectPage({ params }) {
  const data = await getData(params.groupId);

  if (!data) {
    return (
      <AppShell>
        <div className="min-h-full bg-white pt-24 text-center text-muted">Not available.</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <StatusBar />
        <EndProjectFlow groupId={data.group.id} groupStatus={data.group.status} projectId={data.group.project_id} members={data.members} />
      </div>
    </AppShell>
  );
}
