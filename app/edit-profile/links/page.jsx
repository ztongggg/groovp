import AppShell from "@/components/AppShell";
import EditLinksForm from "@/components/EditLinksForm";
import { createClient } from "@/lib/supabase/server";

async function getData() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { profile: {}, pastProjects: [] };
    const { data: p } = await supabase.from("profiles").select("linkedin_url, github_url, portfolio_url").eq("id", user.id).single();

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
          // Unlinked entries use the role as their title, so don't repeat it below.
          subtitle: [proj?.name ? r.role : null, proj ? (ongoing ? "Ongoing" : "Completed") : null].filter(Boolean).join(" · "),
        };
      });
    } catch {}

    return { profile: p || {}, pastProjects };
  } catch {
    return { profile: {}, pastProjects: [] };
  }
}

export default async function EditLinksPage() {
  const { profile, pastProjects } = await getData();
  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <EditLinksForm initial={profile} pastProjects={pastProjects} />
      </div>
    </AppShell>
  );
}
