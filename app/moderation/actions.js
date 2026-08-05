"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function reportUser(reportedId, reason, details) {
  if (!reportedId || !reason) return { error: "Pick a reason." };
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (user.id === reportedId) return { error: "You can't report yourself." };

  const { error } = await supabase
    .from("reports")
    .insert({ reporter_id: user.id, reported_user_id: reportedId, reason, details: details?.trim() || null });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function blockUser(blockedId) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (user.id === blockedId) return { error: "You can't block yourself." };

  const { error } = await supabase.from("blocks").insert({ blocker_id: user.id, blocked_id: blockedId });
  if (error && error.code !== "23505") return { error: error.message };
  revalidatePath(`/u/${blockedId}`);
  return { ok: true };
}

export async function unblockUser(blockedId) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  await supabase.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", blockedId);
  revalidatePath(`/u/${blockedId}`);
  revalidatePath("/settings/blocked");
  return { ok: true };
}

// --- Admin moderation review (RLS restricts these to is_admin users) ---

// Set a report's status. resolve = actioned; dismiss = no action needed.
export async function setReportStatus(reportId, status) {
  if (!["resolved", "dismissed", "open"].includes(status)) return { error: "Bad status." };
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);
  if (error) return { error: error.message };
  revalidatePath("/moderation");
  return { ok: true };
}
