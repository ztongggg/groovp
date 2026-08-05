import HomeView from "@/components/HomeView";
import TutorialOverlay from "@/components/TutorialOverlay";
import { createClient } from "@/lib/supabase/server";

function fmt(d) {
  if (!d) return "";
  const [y, m, day] = d.split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

// Tutorial 1 - Home Feed (Figma 1314:35). Real Home data + a spotlight overlay
// around the first feed card — same underlying query Home itself makes.
async function getData() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let name = "there";
    if (user) {
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      name = p?.full_name || (user.email || "there").split("@")[0];
    }
    const { data: rows } = await supabase
      .from("projects")
      .select("id,name,description,skills_needed,timeline_start,timeline_end,max_size, groups(group_members(count))")
      .order("created_at", { ascending: false });
    const projects = (rows || []).map((p) => {
      const members = p.groups?.[0]?.group_members?.[0]?.count ?? 0;
      return { id: p.id, title: p.name, desc: p.description || "", skills: p.skills_needed || [], count: `${members}/${p.max_size || 0}`, date: `${fmt(p.timeline_start)} - ${fmt(p.timeline_end)}` };
    });
    return { name, projects };
  } catch {
    return { name: "there", projects: [] };
  }
}

export default async function Tutorial1Page() {
  const { name, projects } = await getData();
  return (
    <div className="relative">
      <HomeView name={name} projects={projects} recentlyViewed={[]} unread={0} invites={0} />
      <TutorialOverlay
        step={1}
        spotlight={{ top: 481, left: 30, width: 280, height: 299, borderRadius: 18 }}
        title="This is your feed"
        body="Strong Match badges show projects that fit you best."
        showSkip
        nextHref="/tutorial/2"
      />
    </div>
  );
}
