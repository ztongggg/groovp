"use server";

import { createClient } from "@/lib/supabase/server";

// Request to join a group. Idempotent-ish: a duplicate request is treated as
// "already requested" rather than an error (unique constraint on group+user).
export async function requestToJoin(groupId) {
  if (!groupId) return { error: "This project has no group to join yet." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("join_requests")
    .insert({ group_id: groupId, user_id: user.id, status: "pending" });

  if (error) {
    if (error.code === "23505") return { ok: true, already: true }; // unique violation
    return { error: error.message };
  }

  // notify the group's leader
  const { data: g } = await supabase.from("groups").select("leader_id, name, projects(name)").eq("id", groupId).single();
  if (g?.leader_id && g.leader_id !== user.id) {
    await supabase
      .from("notifications")
      .insert({ user_id: g.leader_id, type: "new_join_requests", related_id: groupId, body: `New request to join ${g.projects?.name || g.name}` })
      .then(() => {}, () => {});
  }
  return { ok: true };
}
