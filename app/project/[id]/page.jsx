import Link from "next/link";
import ProjectDetailView from "@/components/ProjectDetailView";
import { createClient } from "@/lib/supabase/server";

function fmt(d) {
  if (!d) return "";
  const [y, m, day] = d.split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

async function getProject(id) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id,name,description,type,skills_needed,timeline_start,timeline_end,max_size, owner:profiles!projects_owner_id_fkey(username), groups(id,name, group_members(user_id, profiles(full_name,username)))")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({ params }) {
  const p = await getProject(params.id);

  if (!p) {
    return (
      <div className="min-h-full bg-white pt-24 text-center text-muted">
        Project not found. <Link href="/discover" className="font-bold text-purple-600">Back to Discover</Link>
      </div>
    );
  }

  const groups = (p.groups || []).map((g) => ({
    id: g.id,
    name: g.name,
    members: (g.group_members || []).map((m) => ({ user_id: m.user_id, name: m.profiles?.full_name || m.profiles?.username || "?" })),
  }));
  const total = groups.reduce((n, g) => n + g.members.length, 0);

  return (
    <ProjectDetailView
      name={p.name}
      description={p.description || ""}
      type={p.type}
      ownerUsername={p.owner?.username || "owner"}
      dateRange={`${fmt(p.timeline_start)} - ${fmt(p.timeline_end)}`}
      skills={p.skills_needed || []}
      memberCount={`${total}/${p.max_size || 0}`}
      maxSize={p.max_size}
      groups={groups}
    />
  );
}
