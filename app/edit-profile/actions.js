"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(data) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name?.trim() || null,
      username: data.username?.trim() || null,
      university: data.university?.trim() || "SUTD",
      major: data.major?.trim() || null,
      year: data.year || null,
      personality: data.personality || null,
      prefer_working: data.prefer_working || null,
      best_work_time: data.best_work_time || null,
      location: data.location || null,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/profile");
  redirect("/profile");
}
