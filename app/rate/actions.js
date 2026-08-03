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

  const { error } = await supabase
    .from("ratings")
    .insert({ rater_id: user.id, ratee_id: rateeId, stars, comment: comment?.trim() || null });
  if (error) return { error: error.message };

  revalidatePath(`/u/${rateeId}`);
  return { ok: true };
}
