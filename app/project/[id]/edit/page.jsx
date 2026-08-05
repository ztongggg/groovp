import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import EditProjectForm from "@/components/EditProjectForm";
import { createClient } from "@/lib/supabase/server";

async function getData(projectId) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: p } = await supabase
      .from("projects")
      .select("id, owner_id, name, description, photo_url, cover_image_url, type, skills_needed, interests, min_size, max_size, number_of_groups, timeline_start, timeline_end, privacy, joining_method, project_link, resource_files, course_code, instructor, things_to_note")
      .eq("id", projectId)
      .single();
    if (!p || p.owner_id !== user.id) return null;

    return p;
  } catch {
    return null;
  }
}

export default async function EditProjectPage({ params }) {
  const project = await getData(params.id);

  if (!project) {
    return (
      <AppShell>
        <div className="min-h-full bg-white pt-24 text-center text-muted">
          You don&apos;t have access to edit this project.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href={`/project/${project.id}`} className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Edit Project</h1>
        </div>

        <EditProjectForm project={project} />
      </div>
    </AppShell>
  );
}
