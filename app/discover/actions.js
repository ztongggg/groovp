"use server";

import { createClient } from "@/lib/supabase/server";
import { groupHasRoom } from "@/lib/capacity";
import { shouldNotify } from "@/lib/notify";

// Request to join a group. Idempotent-ish: a duplicate request is treated as
// "already requested" rather than an error (unique constraint on group+user).
export async function requestToJoin(groupId, note) {
  const comment = (note || "").trim() || null;
  if (!groupId) return { error: "This project has no group to join yet." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: g } = await supabase
    .from("groups")
    .select("id, leader_id, project_id, name, joining_method, recruiting")
    .eq("id", groupId)
    .single();
  if (!g) return { error: "Group not found." };
  if (g.recruiting === false) return { error: "This group isn't recruiting right now." };
  // A leader requesting to join their own group left a self-request sitting in
  // their own Join Requests list forever (seen in live data).
  if (g.leader_id === user.id) return { ok: true, already: true };

  // Already a member? Nothing to do.
  const { data: mem } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (mem) return { ok: true, already: true };

  const { data: existing } = await supabase
    .from("join_requests")
    .select("id, status, declined_at")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  // Auto-join groups: add the member straight away, no approval.
  if (g.joining_method === "auto") {
    const room = await groupHasRoom(supabase, groupId, user.id);
    if (room.full) return { error: "This group is already full." };
    const { error: mErr } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: user.id, role: "member" });
    if (mErr && mErr.code !== "23505") return { error: mErr.message };
    if (g.project_id) {
      await supabase.from("project_members").insert({ project_id: g.project_id, user_id: user.id }).then(() => {}, () => {});
    }
    if (existing) await supabase.from("join_requests").update({ status: "accepted" }).eq("id", existing.id);
    else await supabase.from("join_requests").insert({ group_id: groupId, user_id: user.id, status: "accepted" }).then(() => {}, () => {});
    await notifyJoined(supabase, g, user.id);
    return { ok: true, joined: true };
  }

  // Approval groups: same capacity guard the auto-join path already had — a
  // pending request shouldn't be acceptable-in-principle if there's no room.
  const room = await groupHasRoom(supabase, groupId, user.id);
  if (room.full) return { error: "This group is already full." };

  // Approval groups: create / revive a pending request.
  if (existing) {
    if (existing.status === "declined") {
      // 3-day cooldown after a decline before the same applicant can reapply.
      const cooldownMs = 3 * 24 * 60 * 60 * 1000;
      const declinedAt = existing.declined_at ? new Date(existing.declined_at).getTime() : 0;
      if (Date.now() - declinedAt < cooldownMs) {
        return { error: "You can reapply to this group 3 days after being declined." };
      }
      const { error: reErr } = await supabase
        .from("join_requests")
        .update({ status: "pending", declined_at: null, comment })
        .eq("id", existing.id);
      if (reErr) return { error: reErr.message };
      await notifyLeader(supabase, groupId, user.id);
      return { ok: true, reapplied: true };
    }
    return { ok: true, already: true }; // pending or accepted
  }

  const { error } = await supabase
    .from("join_requests")
    .insert({ group_id: groupId, user_id: user.id, status: "pending", comment });

  if (error) {
    if (error.code === "23505") return { ok: true, already: true }; // race: unique violation
    return { error: error.message };
  }

  await notifyLeader(supabase, groupId, user.id);
  return { ok: true };
}

// Auto-join: tell the leader someone joined.
async function notifyJoined(supabase, g, joinerId) {
  try {
    if (g?.leader_id && g.leader_id !== joinerId && (await shouldNotify(supabase, g.leader_id, "notify_join_accepted"))) {
      const { data: proj } = g.project_id ? await supabase.from("projects").select("name").eq("id", g.project_id).single() : { data: null };
      const { data: who } = await supabase.from("profiles").select("full_name, username").eq("id", joinerId).single();
      const nm = who?.full_name || who?.username || "Someone";
      await supabase.from("notifications").insert({ user_id: g.leader_id, type: "join_accepted", related_id: g.id, body: `${nm} joined ${proj?.name || g.name}` });
    }
  } catch {}
}

// Notify a group's leader of a new/renewed join request.
// Two plain queries — no embed, which was failing on Vercel.
async function notifyLeader(supabase, groupId, applicantId) {
  try {
    const { data: g } = await supabase.from("groups").select("leader_id, project_id, name").eq("id", groupId).single();
    if (g?.leader_id && g.leader_id !== applicantId && (await shouldNotify(supabase, g.leader_id, "notify_join_requests"))) {
      const { data: proj } = await supabase.from("projects").select("name").eq("id", g.project_id).single();
      await supabase.from("notifications").insert({ user_id: g.leader_id, type: "new_join_requests", related_id: groupId, body: `New request to join ${proj?.name || g.name}` });
    }
  } catch {}
}
