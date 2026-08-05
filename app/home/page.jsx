import AppShell from "@/components/AppShell";
import HomeView from "@/components/HomeView";
import { createClient } from "@/lib/supabase/server";

function fmt(d) {
  if (!d) return "";
  const [y, m, day] = d.split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

async function getData() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let name = "there";
    let unread = 0;
    let invites = 0;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      name = profile?.full_name || (user.email || "there").split("@")[0];
      try {
        const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false);
        unread = count || 0;
      } catch {}
      try {
        const { count } = await supabase.from("join_requests").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "invited");
        invites = count || 0;
      } catch {}
    }

    const { data: rows } = await supabase
      .from("projects")
      .select("id,name,description,skills_needed,timeline_start,timeline_end,max_size,cover_image_url, groups(group_members(count))")
      .order("created_at", { ascending: false });

    const mapProject = (p) => {
      const members = p.groups?.[0]?.group_members?.[0]?.count ?? 0;
      return {
        id: p.id,
        title: p.name,
        desc: p.description || "",
        skills: p.skills_needed || [],
        count: `${members}/${p.max_size || 0}`,
        date: `${fmt(p.timeline_start)} - ${fmt(p.timeline_end)}`,
        coverImageUrl: p.cover_image_url,
      };
    };
    const projects = (rows || []).map(mapProject);

    let recentlyViewed = [];
    if (user) {
      try {
        const { data: views } = await supabase
          .from("project_views")
          .select("project_id, viewed_at")
          .eq("user_id", user.id)
          .order("viewed_at", { ascending: false })
          .limit(10);
        const byId = Object.fromEntries((rows || []).map((p) => [p.id, p]));
        recentlyViewed = (views || []).map((v) => byId[v.project_id]).filter(Boolean).map(mapProject);
      } catch {}
    }

    return { name, projects, recentlyViewed, unread, invites };
  } catch {
    return { name: "there", projects: [], recentlyViewed: [], unread: 0, invites: 0 };
  }
}

export default async function HomePage() {
  const { name, projects, recentlyViewed, unread, invites } = await getData();
  return (
    <AppShell>
      <HomeView name={name} projects={projects} recentlyViewed={recentlyViewed} unread={unread} invites={invites} />
    </AppShell>
  );
}
