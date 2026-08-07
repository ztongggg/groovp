"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { groupHasRoom } from "@/lib/capacity";
import { shouldNotify } from "@/lib/notify";

// Leader accepts an applicant: mark request accepted + add them as a member.
export async function acceptRequest(id, groupId, applicantId) {
  const supabase = createClient();

  // Capacity guard — don't let a group exceed its max.
  const cap = await groupHasRoom(supabase, groupId, applicantId);
  if (cap.full) return { error: "This group is already full." };
  if (cap.member) return { ok: true, already: true };

  const { error } = await supabase
    .from("join_requests")
    .update({ status: "accepted" })
    .eq("id", id);
  if (error) return { error: error.message };

  await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: applicantId, role: "member" });

  // notify the accepted applicant (two plain queries — no embed)
  try {
    const { data: g } = await supabase.from("groups").select("project_id, name").eq("id", groupId).single();
    // Keep the project roster in sync: a group member is also a project member.
    if (g?.project_id) {
      await supabase.from("project_members").insert({ project_id: g.project_id, user_id: applicantId }).then(() => {}, () => {});
    }
    const { data: proj } = g?.project_id ? await supabase.from("projects").select("name").eq("id", g.project_id).single() : { data: null };
    if (await shouldNotify(supabase, applicantId, "notify_join_accepted")) {
      await supabase.from("notifications").insert({ user_id: applicantId, type: "join_accepted", related_id: groupId, body: `You're in! Accepted into ${proj?.name || g?.name || "a group"}` });
    }
  } catch {}

  revalidatePath("/applicants");
  return { ok: true };
}

export async function declineRequest(id, reason) {
  const supabase = createClient();
  const { data: req } = await supabase.from("join_requests").select("user_id, group_id").eq("id", id).single();

  const cleanReason = (reason || "").trim() || null;
  const { error } = await supabase
    .from("join_requests")
    .update({ status: "declined", declined_at: new Date().toISOString(), decline_reason: cleanReason })
    .eq("id", id);
  if (error) return { error: error.message };

  // The applicant is told either way — the Notifications frame shows an
  // "Application declined" row, and previously a decline was silent (and,
  // separately, gave no reason at all — someone got rejected with zero
  // feedback and a 3-day blind wait before reapplying).
  // Gated on the same "updates about my requests" preference as an accept.
  try {
    if (req?.user_id && (await shouldNotify(supabase, req.user_id, "notify_join_accepted"))) {
      const { data: g } = await supabase.from("groups").select("project_id, name").eq("id", req.group_id).single();
      const { data: proj } = g?.project_id ? await supabase.from("projects").select("name").eq("id", g.project_id).single() : { data: null };
      const suffix = cleanReason ? ` — "${cleanReason}"` : "";
      await supabase.from("notifications").insert({
        user_id: req.user_id,
        type: "join_declined",
        related_id: req.group_id,
        body: `Your request to join ${proj?.name || g?.name || "a group"} was declined${suffix}`,
      });
    }
  } catch {}

  revalidatePath("/applicants");
  return { ok: true };
}
