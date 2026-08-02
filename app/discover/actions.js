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
  return { ok: true };
}
