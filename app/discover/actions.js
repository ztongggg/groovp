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

  // If a previous request exists, decide what to do based on its status.
  // A declined applicant is allowed to reapply (flip declined -> pending);
  // a pending/accepted one is simply told they've already requested.
  const { data: existing } = await supabase
    .from("join_requests")
    .select("id, status")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === "declined") {
      const { error: reErr } = await supabase
        .from("join_requests")
        .update({ status: "pending" })
        .eq("id", existing.id);
      if (reErr) return { error: reErr.message };
      await notifyLeader(supabase, groupId, user.id);
      return { ok: true, reapplied: true };
    }
    return { ok: true, already: true }; // pending or accepted
  }

  const { error } = await supabase
    .from("join_requests")
    .insert({ group_id: groupId, user_id: user.id, status: "pending" });

  if (error) {
    if (error.code === "23505") return { ok: true, already: true }; // race: unique violation
    return { error: error.message };
  }

  await notifyLeader(supabase, groupId, user.id);
  return { ok: true };
}

// Notify a group's leader of a new/renewed join request.
// Two plain queries — no embed, which was failing on Vercel.
async function notifyLeader(supabase, groupId, applicantId) {
  try {
    const { data: g } = await supabase.from("groups").select("leader_id, project_id, name").eq("id", groupId).single();
    if (g?.leader_id && g.leader_id !== applicantId) {
      const { data: proj } = await supabase.from("projects").select("name").eq("id", g.project_id).single();
      await supabase.from("notifications").insert({ user_id: g.leader_id, type: "new_join_requests", related_id: groupId, body: `New request to join ${proj?.name || g.name}` });
    }
  } catch {}
}
