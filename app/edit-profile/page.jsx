import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import EditProfileForm from "@/components/EditProfileForm";
import { createClient } from "@/lib/supabase/server";

async function getProfile() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { profile: {}, pastProjects: [] };
    const { data: p } = await supabase.from("profiles").select("full_name, username, avatar_url, bio, university, major, year, personality, prefer_working, best_work_time, location, skills, interests, linkedin_url, github_url, portfolio_url").eq("id", user.id).single();

    // Prefer per-skill proficiency (user_skills); fall back to plain names.
    let skills = (p?.skills || []).map((n) => ({ name: n, level: "Basic" }));
    try {
      const { data: us } = await supabase.from("user_skills").select("skill_name, proficiency").eq("user_id", user.id);
      if (us?.length) skills = us.map((r) => ({ name: r.skill_name, level: r.proficiency || "Basic" }));
    } catch {}

    // Projects & Links step lists the user's past projects.
    let pastProjects = [];
    try {
      const { data: pp } = await supabase.from("past_projects").select("id, role, project_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
      const projIds = (pp || []).map((r) => r.project_id).filter(Boolean);
      let projById = {};
      if (projIds.length) {
        const { data: projs } = await supabase.from("projects").select("id, name, timeline_end").in("id", projIds);
        projById = Object.fromEntries((projs || []).map((r) => [r.id, r]));
      }
      pastProjects = (pp || []).map((r) => {
        const proj = r.project_id ? projById[r.project_id] : null;
        const ongoing = proj?.timeline_end ? new Date(proj.timeline_end) > new Date() : true;
        return {
          id: r.id,
          name: proj?.name || r.role || "Untitled project",
          subtitle: [r.role, proj ? (ongoing ? "Ongoing" : "Completed") : null].filter(Boolean).join(" · "),
        };
      });
    } catch {}

    return { profile: { ...(p || {}), skills, interests: p?.interests || [] }, pastProjects };
  } catch {
    return { profile: {}, pastProjects: [] };
  }
}

export default async function EditProfilePage({ searchParams }) {
  const { profile, pastProjects } = await getProfile();
  // My Profile's SKILLS / INTERESTS cards deep-link straight into their step of
  // the edit wizard (Figma routes them to "Edit Skills" / "Edit Interests").
  const step = Math.min(3, Math.max(0, parseInt(searchParams?.step ?? "0", 10) || 0));
  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <StatusBar />
        <EditProfileForm initial={profile} initialStep={step} pastProjects={pastProjects} />
      </div>
    </AppShell>
  );
}
