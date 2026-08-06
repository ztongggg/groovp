"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { savePastProject } from "@/lib/pastProjects";

// The "Add Project to Profile" step after ending a project — unlike the generic
// past-projects/add flow (and Signup Step 6's version), the real project_id is
// known here, so it gets set for real instead of landing as a freestanding entry.
export async function addPastProjectForProject(projectId, role, writeUp, photos = []) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const res = await savePastProject(supabase, { userId: user.id, projectId, role, writeUp, photos });
  if (res?.error) return { error: res.error };

  revalidatePath("/profile");
  return { ok: true };
}
