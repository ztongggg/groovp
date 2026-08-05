"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Host-only edit of a project's own fields, separate from any individual
// group's recruiting settings. RLS (`projects_write`) already restricts this
// to auth.uid() = owner_id, this is just the app-level guard + validation.
export async function updateProject(projectId, data) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (!data.name?.trim()) return { error: "Project name is required." };

  const minSize = Math.max(1, Number(data.min_size) || 1);
  const maxSize = Math.max(minSize, Number(data.max_size) || minSize);
  if (data.timeline_start && data.timeline_end && data.timeline_start > data.timeline_end) {
    return { error: "End date can't be before the start date." };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      photo_url: data.photo_url || null,
      cover_image_url: data.cover_image_url || null,
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
      course_code: data.course_code?.trim() || null,
      instructor: data.instructor?.trim() || null,
      things_to_note: data.things_to_note?.trim() || null,
    })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/project/${projectId}`);
  revalidatePath(`/project/${projectId}/edit`);
  return { ok: true };
}
