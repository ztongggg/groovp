import Link from "next/link";
import AppShell from "@/components/AppShell";
import EditGroupForm from "@/components/EditGroupForm";
import { createClient } from "@/lib/supabase/server";

async function getData(groupId) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: g } = await supabase.from("groups").select("id, name, photo_url, leader_id, min_members, max_members, status").eq("id", groupId).single();
    if (!g) return null;

    const { data: members } = await supabase.from("group_members").select("user_id, role").eq("group_id", groupId);
    const ids = (members || []).map((m) => m.user_id);
    const { data: profiles } = ids.length ? await supabase.from("profiles").select("id, full_name, username").in("id", ids) : { data: [] };
    const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

    return {
      group: g,
      meId: user.id,
      isLeader: g.leader_id === user.id,
      members: (members || []).map((m) => ({
        userId: m.user_id,
        role: m.role,
        name: byId[m.user_id]?.full_name || byId[m.user_id]?.username || "Someone",
      })),
    };
  } catch {
    return null;
  }
}

export default async function EditGroupPage({ params }) {
  const data = await getData(params.groupId);

  if (!data) {
    return (
      <AppShell>
        <div className="min-h-full bg-white pt-24 text-center text-muted">Group not found.</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <div className="flex items-center gap-3 px-6">
          <Link href={`/chat/${data.group.id}`} className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Edit Group</h1>
        </div>

        <EditGroupForm group={data.group} meId={data.meId} isLeader={data.isLeader} members={data.members} />
      </div>
    </AppShell>
  );
}
