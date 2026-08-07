"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(data) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  // skills may be [{ name, level }] (new) or plain strings (defensive)
  const skillList = (data.skills || []).map((s) => (typeof s === "string" ? { name: s, level: "Basic" } : s));

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name?.trim() || null,
      username: data.username?.trim() || null,
      avatar_url: data.avatar_url?.trim() || null,
      bio: data.bio?.trim() || null,
      // university intentionally NOT here — it's derived from the verified signup
      // email domain (see app/auth/actions.js signUpFull), not user-editable, or the
      // "Restricted (same school)" privacy tier would mean nothing.
      major: data.major?.trim() || null,
      year: data.year || null,
      personality: data.personality || null,
      prefer_working: data.prefer_working || null,
      best_work_time: data.best_work_time || null,
      location: data.location || null,
      skills: skillList.map((s) => s.name),
      interests: data.interests || [],
      linkedin_url: data.linkedin_url?.trim() || null,
      github_url: data.github_url?.trim() || null,
      portfolio_url: data.portfolio_url?.trim() || null,
    })
    .eq("id", user.id);
  if (error) {
    // Friendly message for the most common failure.
    if (error.code === "23505") return { error: "That username is already taken." };
    return { error: error.message };
  }

  // Rebuild per-skill proficiency (needs the v2 user_skills table; ignore if absent).
  try {
    await supabase.from("user_skills").delete().eq("user_id", user.id);
    if (skillList.length) {
      await supabase.from("user_skills").insert(skillList.map((s) => ({ user_id: user.id, skill_name: s.name, proficiency: s.level })));
    }
  } catch {}

  revalidatePath("/profile");
  redirect("/profile");
}
