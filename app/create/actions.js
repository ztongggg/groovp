"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { markTaskEnd } from "@/lib/experiment"; // EXPERIMENT: see lib/experiment.js

// A short, human-shareable code: GRV-XXXXX (no ambiguous 0/O/1/I chars).
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode() {
  let s = "";
  for (let i = 0; i < 5; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return `GRV-${s}`;
}

// Create a project + its first group + owner membership. Returns the new id
// so the client can show a congrats screen.
export async function createProject(data) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (!data.name?.trim()) return { error: "Project name is required." };

  // Server-side sanity guards (client can be bypassed).
  const minSize = Math.max(1, Number(data.min_size) || 1);
  const maxSize = Math.max(minSize, Number(data.max_size) || minSize);
  if (data.timeline_start && data.timeline_end && data.timeline_start > data.timeline_end) {
    return { error: "End date can't be before the start date." };
  }

  // Insert with a unique join_code, retrying if we hit the rare collision.
  let project = null;
  let lastErr = null;
  for (let attempt = 0; attempt < 5 && !project; attempt++) {
    const { data: p, error } = await supabase
      .from("projects")
      .insert({
        owner_id: user.id,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        photo_url: data.photo_url || null,
        cover_image_url: data.cover_image_url || null,
        type: data.type || "academic",
        skills_needed: data.skills || [],
        interests: data.interests || [],
        min_size: minSize,
        max_size: maxSize,
        timeline_start: data.timeline_start || null,
        timeline_end: data.timeline_end || null,
        privacy: data.privacy || "public",
        joining_method: data.joining_method || "approval",
        project_link: data.project_link?.trim() || null,
        resource_files: (data.resource_files || []).map((f) => f.url),
        allow_multiple_groups: (data.type || "academic") === "academic",
        number_of_groups: (data.type || "academic") === "academic" ? Math.max(1, Number(data.number_of_groups) || 1) : 1,
        join_code: makeCode(),
      })
      .select()
      .single();
    if (p) { project = p; break; }
    lastErr = error;
    if (error?.code !== "23505") break; // only retry on unique-code collision
  }
  if (!project) return { error: lastErr?.message || "Could not create project." };

  const { data: group } = await supabase
    .from("groups")
    .insert({ project_id: project.id, name: "Group A", leader_id: user.id })
    .select()
    .single();
  if (group) {
    await supabase.from("group_members").insert({ group_id: group.id, user_id: user.id, role: "leader" });
  }
  // Owner is on the project roster too.
  await supabase.from("project_members").insert({ project_id: project.id, user_id: user.id }).then(() => {}, () => {});

  revalidatePath("/discover");
  revalidatePath("/home");
  await markTaskEnd(3); // EXPERIMENT: no-op for real users — project + its Group A both exist now
  return { ok: true, projectId: project.id, name: project.name, joinCode: project.join_code };
}
