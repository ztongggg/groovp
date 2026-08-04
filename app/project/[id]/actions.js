"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Form a new group inside an existing project. The creator becomes its leader.
// Requires: signed in, enrolled in the project, and the project allows multiple groups.
export async function createGroupInProject(projectId) {
  if (!projectId) return { error: "Missing project." };
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: project } = await supabase
    .from("projects")
    .select("id, allow_multiple_groups")
    .eq("id", projectId)
    .single();
  if (!project) return { error: "Project not found." };

  // Must be on the roster to form a group.
  const { data: pm } = await supabase
    .from("project_members")
    .select("user_id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!pm) return { error: "Join the project first." };

  // Existing groups → decide a name and enforce the single-group rule for personal projects.
  const { data: existing } = await supabase.from("groups").select("id").eq("project_id", projectId);
  const count = existing?.length || 0;
  if (project.allow_multiple_groups === false && count >= 1) {
    return { error: "This project only allows one group." };
  }
  // Don't let someone lead two groups in the same project.
  const { data: mine } = await supabase.from("groups").select("id").eq("project_id", projectId).eq("leader_id", user.id).maybeSingle();
  if (mine) return { error: "You already lead a group here.", groupId: mine.id };

  const name = `Group ${String.fromCharCode(65 + count)}`; // A, B, C, ...

  const { data: group, error } = await supabase
    .from("groups")
    .insert({ project_id: projectId, name, leader_id: user.id })
    .select()
    .single();
  if (error) return { error: error.message };

  await supabase.from("group_members").insert({ group_id: group.id, user_id: user.id, role: "leader" });

  revalidatePath(`/project/${projectId}`);
  return { ok: true, groupId: group.id };
}
