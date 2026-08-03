"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(projectId, currentlyFav) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  if (currentlyFav) {
    await supabase.from("project_favorites").delete().eq("user_id", user.id).eq("project_id", projectId);
  } else {
    const { error } = await supabase.from("project_favorites").insert({ user_id: user.id, project_id: projectId });
    if (error && error.code !== "23505") return { error: error.message };
  }
  revalidatePath("/saved");
  revalidatePath(`/project/${projectId}`);
  return { ok: true, favorited: !currentlyFav };
}
