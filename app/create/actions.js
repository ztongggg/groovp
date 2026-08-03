"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Create a project + its first group + owner membership. Returns the new id
// so the client can show a congrats screen.
export async function createProject(data) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (!data.name?.trim()) return { error: "Project name is required." };

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      type: data.type || "academic",
      skills_needed: data.skills || [],
      interests: data.interests || [],
      min_size: data.min_size || 2,
      max_size: data.max_size || 5,
      timeline_start: data.timeline_start || null,
      timeline_end: data.timeline_end || null,
      privacy: data.privacy || "public",
      joining_method: data.joining_method || "approval",
      project_link: data.project_link?.trim() || null,
      allow_multiple_groups: (data.type || "academic") === "academic",
    })
    .select()
    .single();
  if (error) return { error: error.message };

  const { data: group } = await supabase
    .from("groups")
    .insert({ project_id: project.id, name: "Group A", leader_id: user.id })
    .select()
    .single();
  if (group) {
    await supabase.from("group_members").insert({ group_id: group.id, user_id: user.id, role: "leader" });
  }

  revalidatePath("/discover");
  revalidatePath("/home");
  return { ok: true, projectId: project.id, name: project.name };
}
