"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Per-group recruiting settings. Only the group's leader may save.
export async function saveRecruiting(groupId, data) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("groups")
    .update({
      recruiting: data.recruiting,
      members_wanted: data.members_wanted || 0,
      skills_wanted: data.skills_wanted || [],
      personality_wanted: data.personality_wanted || [],
      interests_wanted: data.interests_wanted || [],
      additional_notes: data.additional_notes?.trim() || null,
      joining_method: data.joining_method || "approval",
    })
    .eq("id", groupId)
    .eq("leader_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/recruiting/${groupId}`);
  return { ok: true };
}

// Leader invites a user by username. Creates (or revives) a join_request with
// status 'invited' that the invitee accepts/declines from /invites.
export async function inviteByUsername(groupId, rawUsername) {
  const username = (rawUsername || "").trim().replace(/^@/, "");
  if (!username) return { error: "Enter a username." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  // Only the group's leader may invite.
  const { data: g } = await supabase
    .from("groups")
    .select("id, leader_id, project_id, name")
    .eq("id", groupId)
    .single();
  if (!g) return { error: "Group not found." };
  if (g.leader_id !== user.id) return { error: "Only the group leader can invite." };

  // Resolve username -> profile.
  const { data: target } = await supabase
    .from("profiles")
    .select("id, full_name, username")
    .ilike("username", username)
    .maybeSingle();
  if (!target) return { error: `No user with username "${username}".` };
  if (target.id === user.id) return { error: "You can't invite yourself." };

  // Already a member?
  const { data: mem } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", target.id)
    .maybeSingle();
  if (mem) return { error: `${target.full_name || username} is already in this group.` };

  // Revive an existing request row, or create a fresh invite.
  const { data: existing } = await supabase
    .from("join_requests")
    .select("id, status")
    .eq("group_id", groupId)
    .eq("user_id", target.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === "invited") return { ok: true, already: true };
    const { error: upErr } = await supabase
      .from("join_requests")
      .update({ status: "invited" })
      .eq("id", existing.id);
    if (upErr) return { error: upErr.message };
  } else {
    const { error: insErr } = await supabase
      .from("join_requests")
      .insert({ group_id: groupId, user_id: target.id, status: "invited" });
    if (insErr) return { error: insErr.message };
  }

  // Notify the invitee (two plain queries — no embed).
  try {
    const { data: proj } = g.project_id
      ? await supabase.from("projects").select("name").eq("id", g.project_id).single()
      : { data: null };
    await supabase.from("notifications").insert({
      user_id: target.id,
      type: "invite",
      related_id: groupId,
      body: `You've been invited to join ${proj?.name || g.name}`,
    });
  } catch {}

  revalidatePath(`/recruiting/${groupId}`);
  return { ok: true, name: target.full_name || username };
}
