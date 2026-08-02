"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Leader accepts an applicant: mark request accepted + add them as a member.
export async function acceptRequest(id, groupId, applicantId) {
  const supabase = createClient();

  const { error } = await supabase
    .from("join_requests")
    .update({ status: "accepted" })
    .eq("id", id);
  if (error) return { error: error.message };

  await supabase
    .from("group_members")
    .insert({ group_id: groupId, user_id: applicantId, role: "member" });

  revalidatePath("/applicants");
  return { ok: true };
}

export async function declineRequest(id) {
  const supabase = createClient();
  const { error } = await supabase
    .from("join_requests")
    .update({ status: "declined" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/applicants");
  return { ok: true };
}
