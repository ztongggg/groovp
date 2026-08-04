"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitRating(rateeId, stars, comment) {
  if (!rateeId) return { error: "Missing user." };
  if (!stars || stars < 1 || stars > 5) return { error: "Pick 1–5 stars." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (user.id === rateeId) return { error: "You can't rate yourself." };

  // One rating per pair — re-rating updates the existing one (needs the
  // ratings_rater_ratee_uniq index from schema_v6).
  const { error } = await supabase
    .from("ratings")
    .upsert(
      { rater_id: user.id, ratee_id: rateeId, stars, comment: comment?.trim() || null },
      { onConflict: "rater_id,ratee_id" }
    );
  if (error) return { error: error.message };

  revalidatePath(`/u/${rateeId}`);
  return { ok: true };
}
