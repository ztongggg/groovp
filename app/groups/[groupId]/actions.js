"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateGroupName(groupId, name) {
  const trimmed = (name || "").trim();
  if (!trimmed) return { error: "Group name can't be empty." };
  const supabase = createClient();
  const { error } = await supabase.from("groups").update({ name: trimmed }).eq("id", groupId);
  if (error) return { error: error.message };
  revalidatePath(`/groups/${groupId}/edit`);
  return { ok: true };
}

export async function updateGroupPhoto(groupId, photoUrl) {
  const supabase = createClient();
  const { error } = await supabase.from("groups").update({ photo_url: photoUrl }).eq("id", groupId);
  if (error) return { error: error.message };
  revalidatePath(`/groups/${groupId}/edit`);
  return { ok: true };
}

// Leader removes another member. Can't remove yourself this way — use leaveGroup/transferLeadership.
export async function removeMember(groupId, userId) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (user.id === userId) return { error: "Use Leave Group instead." };

  const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", userId);
  if (error) return { error: error.message };
  revalidatePath(`/groups/${groupId}/edit`);
  return { ok: true };
}

// Hand leadership to another current member — required before the leader can leave
// (spec decision: no auto-promotion, leader must transfer or end the project first).
export async function transferLeadership(groupId, newLeaderId) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error: gErr } = await supabase.from("groups").update({ leader_id: newLeaderId }).eq("id", groupId);
  if (gErr) return { error: gErr.message };

  await supabase.from("group_members").update({ role: "member" }).eq("group_id", groupId).eq("user_id", user.id);
  await supabase.from("group_members").update({ role: "leader" }).eq("group_id", groupId).eq("user_id", newLeaderId);

  revalidatePath(`/groups/${groupId}/edit`);
  return { ok: true };
}

// Regular member leaving. The leader is blocked from calling this directly by the UI
// (EditGroupForm intercepts and shows transfer-or-end-project instead) — enforced here
// too as a backstop in case that's ever bypassed.
export async function leaveGroup(groupId) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: g } = await supabase.from("groups").select("leader_id").eq("id", groupId).single();
  if (g?.leader_id === user.id) return { error: "Transfer leadership or end the project before leaving." };

  const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/teams");
  return { ok: true };
}

// Search candidates to invite (Invite Member screen). Excludes existing members,
// self, and anyone blocked in either direction (spec: can't invite someone who's
// blocked you or whom you've blocked). Flags anyone already invited/applied so the
// UI can show "Already invited" / "Already applied" instead of a silent duplicate.
export async function searchInviteCandidates(groupId, query) {
  const q = (query || "").trim();
  if (q.length < 2) return [];
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: members } = await supabase.from("group_members").select("user_id").eq("group_id", groupId);
  const memberIds = new Set((members || []).map((m) => m.user_id));

  const { data: blocksMine } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", user.id);
  const { data: blocksTheirs } = await supabase.from("blocks").select("blocker_id").eq("blocked_id", user.id);
  const blockedIds = new Set([...(blocksMine || []).map((b) => b.blocked_id), ...(blocksTheirs || []).map((b) => b.blocker_id)]);

  const { data: candidates } = await supabase
    .from("profiles")
    .select("id, full_name, username, year, major, university")
    .or(`full_name.ilike.%${q}%,username.ilike.%${q}%`)
    .limit(20);

  const filtered = (candidates || []).filter((c) => c.id !== user.id && !memberIds.has(c.id) && !blockedIds.has(c.id));
  if (filtered.length === 0) return [];

  const { data: existing } = await supabase
    .from("join_requests")
    .select("user_id, status")
    .eq("group_id", groupId)
    .in("user_id", filtered.map((c) => c.id));
  const statusById = Object.fromEntries((existing || []).map((r) => [r.user_id, r.status]));

  return filtered.map((c) => ({ ...c, requestStatus: statusById[c.id] || null }));
}

// Leader ends the project's group. Just flips status for now — the fuller
// Rate Teammates / Add Project to Profile follow-on sequence (Figma nodes
// 570:14873, 570:14915) isn't built yet, see HANDOFF.
export async function endProject(groupId) {
  const supabase = createClient();
  const { error } = await supabase.from("groups").update({ status: "Ended" }).eq("id", groupId);
  if (error) return { error: error.message };
  revalidatePath(`/groups/${groupId}/edit`);
  return { ok: true };
}
