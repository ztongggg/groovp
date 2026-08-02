import AppShell from "@/components/AppShell";
import TeamsView from "@/components/TeamsView";
import { createClient } from "@/lib/supabase/server";

function relTime(iso) {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Applied today";
  if (days === 1) return "Applied 1 day ago";
  if (days < 7) return `Applied ${days} days ago`;
  const w = Math.floor(days / 7);
  return w === 1 ? "Applied 1 week ago" : `Applied ${w} weeks ago`;
}

async function getRequests() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("join_requests")
      .select("id,status,created_at, groups(name, projects(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return [];

    return (data || []).map((r) => ({
      id: r.id,
      status: r.status,
      title: r.groups?.projects?.name || "Project",
      subtitle: r.groups?.name || "Group",
      applied: relTime(r.created_at),
    }));
  } catch {
    return [];
  }
}

export default async function TeamsPage() {
  const requests = await getRequests();
  return (
    <AppShell>
      <TeamsView requests={requests} />
    </AppShell>
  );
}
