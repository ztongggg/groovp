"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Create a project + its first group + owner membership, then go to Discover.
export async function createProject(_prevState, formData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const name = (formData.get("name") || "").toString().trim();
  const description = (formData.get("description") || "").toString().trim();
  const type = (formData.get("type") || "academic").toString();
  const skills = (formData.get("skills") || "")
    .toString()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const min_size = Number(formData.get("min_size")) || 2;
  const max_size = Number(formData.get("max_size")) || 5;
  const timeline_start = formData.get("timeline_start") || null;
  const timeline_end = formData.get("timeline_end") || null;

  if (!name) return { error: "Project name is required." };

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name,
      description,
      type,
      skills_needed: skills,
      min_size,
      max_size,
      timeline_start,
      timeline_end,
    })
    .select()
    .single();
  if (error) return { error: error.message };

  const { data: group, error: gErr } = await supabase
    .from("groups")
    .insert({ project_id: project.id, name: "Group A", leader_id: user.id })
    .select()
    .single();
  if (gErr) return { error: gErr.message };

  await supabase
    .from("group_members")
    .insert({ group_id: group.id, user_id: user.id, role: "leader" });

  redirect("/discover");
}
