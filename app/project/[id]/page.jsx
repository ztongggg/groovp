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
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("projects")
      .select("id,name,description,type,owner_id,join_code,allow_multiple_groups,skills_needed,timeline_start,timeline_end,max_size, owner:profiles!projects_owner_id_fkey(username), groups(id,name,leader_id,recruiting,members_wanted, group_members(user_id, profiles(full_name,username)))")
      .eq("id", id)
      .single();
    if (error) return null;
    let favorited = false;
    let enrolled = false;
    if (user) {
      try {
        const { data: f } = await supabase.from("project_favorites").select("project_id").eq("user_id", user.id).eq("project_id", id).maybeSingle();
        favorited = !!f;
      } catch {}
      try {
        const { data: pm } = await supabase.from("project_members").select("user_id").eq("user_id", user.id).eq("project_id", id).maybeSingle();
        enrolled = !!pm;
      } catch {}
      // Recently Viewed log — best-effort, upsert so repeat views just bump viewed_at.
      supabase.from("project_views").upsert({ user_id: user.id, project_id: id, viewed_at: new Date().toISOString() }).then(() => {}, () => {});
    }
    return { ...data, meId: user?.id || null, favorited, enrolled };
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
    leaderId: g.leader_id,
    recruiting: g.recruiting !== false,
    membersWanted: g.members_wanted || 0,
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
      meId={p.meId}
      projectId={p.id}
      favorited={p.favorited}
      joinCode={p.join_code}
      enrolled={p.enrolled}
      isOwner={p.meId && p.meId === p.owner_id}
      allowMultipleGroups={p.allow_multiple_groups !== false}
    />
  );
}
