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
