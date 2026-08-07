"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const TEXT_FIELDS = ["full_name", "username", "avatar_url", "bio", "university", "major"];
const ENUM_FIELDS = ["year", "personality", "prefer_working", "best_work_time", "location"];
const LINK_FIELDS = ["linkedin_url", "github_url", "portfolio_url"];

// Edit Profile is now several independent screens (Basic Info / Skills /
// Interests / Links), each saving only the fields it shows. `data` only ever
// carries the keys the calling screen edited — every other profile column
// must be left untouched, not overwritten with null.
export async function updateProfile(data, redirectTo = "/profile") {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const patch = {};
  for (const k of TEXT_FIELDS) if (k in data) patch[k] = data[k]?.trim() || null;
  for (const k of ENUM_FIELDS) if (k in data) patch[k] = data[k] || null;
  for (const k of LINK_FIELDS) if (k in data) patch[k] = data[k]?.trim() || null;
  if ("interests" in data) patch.interests = data.interests || [];

  // skills may be [{ name, level }] (new) or plain strings (defensive)
  const skillList = "skills" in data ? (data.skills || []).map((s) => (typeof s === "string" ? { name: s, level: "Basic" } : s)) : null;
  if (skillList) patch.skills = skillList.map((s) => s.name);

  if (Object.keys(patch).length) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) {
      // Friendly message for the most common failure.
      if (error.code === "23505") return { error: "That username is already taken." };
      return { error: error.message };
    }
  }

  // Rebuild per-skill proficiency (needs the v2 user_skills table; ignore if absent).
  if (skillList) {
    try {
      await supabase.from("user_skills").delete().eq("user_id", user.id);
      if (skillList.length) {
        await supabase.from("user_skills").insert(skillList.map((s) => ({ user_id: user.id, skill_name: s.name, proficiency: s.level })));
      }
    } catch {}
  }

  revalidatePath("/profile");
  revalidatePath("/edit-profile");
  redirect(redirectTo);
}
