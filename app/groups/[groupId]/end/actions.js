"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// The "Add Project to Profile" step after ending a project — unlike the generic
// past-projects/add flow (and Signup Step 6's version), the real project_id is
// known here, so it gets set for real instead of landing as a freestanding entry.
export async function addPastProjectForProject(projectId, role, writeUp) {
  const trimmedRole = (role || "").trim();
  if (!trimmedRole) return { error: "Add a title / your role." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("past_projects")
    .insert({ user_id: user.id, project_id: projectId, role: trimmedRole, write_up: writeUp?.trim() || null });
  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { ok: true };
}
