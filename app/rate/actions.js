"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Confirms rater+ratee shared a group under this project, and that group has
// ended — spec: "Can only rate users who shared a group with you on a project
// that has status=Ended."
async function sharedEndedGroup(supabase, raterId, rateeId, projectId) {
  const { data: myGroups } = await supabase
    .from("group_members")
    .select("group_id, groups!inner(project_id, status)")
    .eq("user_id", raterId)
    .eq("groups.project_id", projectId)
    .eq("groups.status", "Ended");
  const myGroupIds = (myGroups || []).map((g) => g.group_id);
  if (!myGroupIds.length) return false;
  const { data: shared } = await supabase.from("group_members").select("group_id").eq("user_id", rateeId).in("group_id", myGroupIds);
  return !!shared?.length;
}

export async function submitRating(rateeId, projectId, stars, comment) {
  if (!rateeId) return { error: "Missing user." };
  if (!projectId) return { error: "Missing project." };
  if (!stars || stars < 1 || stars > 5) return { error: "Pick 1–5 stars." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (user.id === rateeId) return { error: "You can't rate yourself." };

  const eligible = await sharedEndedGroup(supabase, user.id, rateeId, projectId);
  if (!eligible) return { error: "You can only rate teammates from a project you shared with them that's now ended." };

  // One rating per (rater, ratee, project) — re-rating for the same project
  // updates the existing one (needs the ratings_rater_ratee_project_uniq index).
  const { error } = await supabase
    .from("ratings")
    .upsert(
      { rater_id: user.id, ratee_id: rateeId, project_id: projectId, stars, comment: comment?.trim() || null },
      { onConflict: "rater_id,ratee_id,project_id" }
    );
  if (error) return { error: error.message };

  revalidatePath(`/u/${rateeId}`);
  return { ok: true };
}
