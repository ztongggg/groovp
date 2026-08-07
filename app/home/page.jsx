import AppShell from "@/components/AppShell";
import HomeView from "@/components/HomeView";
import { createClient } from "@/lib/supabase/server";
import { STRONG_MATCH_THRESHOLD } from "@/lib/matching";

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
    let mine = new Set();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, skills, interests")
        .eq("id", user.id)
        .single();
      name = profile?.full_name || (user.email || "there").split("@")[0];
      mine = new Set([...(profile?.skills || []), ...(profile?.interests || [])].map((s) => (s || "").toLowerCase()));
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
      .select("id,name,description,skills_needed,interests,timeline_start,timeline_end,max_size,cover_image_url,created_at,status, groups(group_members(count))")
      .order("created_at", { ascending: false });

    const visible = (rows || []).filter((p) => p.status !== "Deleted");

    // Popularity = join-request count + save count (owner-confirmed metric).
    // join_requests is keyed by group, so resolve group -> project first.
    const score = {};
    try {
      const ids = visible.map((p) => p.id);
      const [{ data: grps }, { data: favs }] = await Promise.all([
        supabase.from("groups").select("id,project_id").in("project_id", ids),
        supabase.from("project_favorites").select("project_id").in("project_id", ids),
      ]);
      const groupToProject = Object.fromEntries((grps || []).map((g) => [g.id, g.project_id]));
      const { data: reqs } = await supabase
        .from("join_requests")
        .select("group_id")
        .in("group_id", Object.keys(groupToProject));
      for (const r of reqs || []) {
        const pid = groupToProject[r.group_id];
        if (pid) score[pid] = (score[pid] || 0) + 1;
      }
      for (const f of favs || []) score[f.project_id] = (score[f.project_id] || 0) + 1;
    } catch {}

    const mapProject = (p) => {
      const members = p.groups?.[0]?.group_members?.[0]?.count ?? 0;
      const tags = [...(p.skills_needed || []), ...(p.interests || [])];
      const matchedTags = tags.filter((t) => mine.has((t || "").toLowerCase()));
      return {
        id: p.id,
        title: p.name,
        desc: p.description || "",
        tags,
        matchedTags,
        badge: matchedTags.length >= STRONG_MATCH_THRESHOLD ? "✨ Strong Match" : undefined,
        memberCount: members,
        count: `${members}/${p.max_size || 0}`,
        date: `${fmt(p.timeline_start)} - ${fmt(p.timeline_end)}`,
        coverImageUrl: p.cover_image_url,
      };
    };
    // `visible` is already created_at DESC from the query, so it doubles as Latest.
    const projects = visible.map(mapProject);
    const popular = [...visible]
      .sort((a, b) => (score[b.id] || 0) - (score[a.id] || 0))
      .map(mapProject);

    let recentlyViewed = [];
    if (user) {
      try {
        const { data: views } = await supabase
          .from("project_views")
          .select("project_id, viewed_at")
          .eq("user_id", user.id)
          .order("viewed_at", { ascending: false })
          .limit(10);
        const byId = Object.fromEntries(visible.map((p) => [p.id, p]));
        recentlyViewed = (views || []).map((v) => byId[v.project_id]).filter(Boolean).map(mapProject);
      } catch {}
    }

    return { name, projects, popular, recentlyViewed, unread, invites };
  } catch {
    return { name: "there", projects: [], popular: [], recentlyViewed: [], unread: 0, invites: 0 };
  }
}

export default async function HomePage() {
  const { name, projects, popular, recentlyViewed, unread, invites } = await getData();
  return (
    <AppShell>
      <HomeView name={name} projects={projects} popular={popular} recentlyViewed={recentlyViewed} unread={unread} invites={invites} />
    </AppShell>
  );
}
