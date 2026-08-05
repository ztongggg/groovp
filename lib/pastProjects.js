// Shared past_projects insert — used by Signup Step 6, the standalone
// Projects & Links "+ Add Project" flow, and the post-End-Project "Add to
// Profile" step. Previously each had its own copy with drifted validation
// (role required in two, optional-with-no-storage in the third). Spec:
// "role and write_up optional but recommended (don't force them)."
export async function savePastProject(supabase, { userId, projectId = null, role, writeUp, photos = [] }) {
  if (!userId) return { error: "Missing user." };
  const { data, error } = await supabase
    .from("past_projects")
    .insert({
      user_id: userId,
      project_id: projectId,
      role: role?.trim() || null,
      write_up: writeUp?.trim() || null,
      photos,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  return { ok: true, id: data.id };
}
