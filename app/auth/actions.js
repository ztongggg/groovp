"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signUp(_prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const full_name = formData.get("full_name");
  const username = formData.get("username");

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, username } },
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/home");
}

// Multi-step signup: create the auth user, then fill the profile row.
export async function signUpFull(data) {
  const supabase = createClient();

  const { data: auth, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { full_name: data.full_name, username: data.username } },
  });
  if (error) return { error: error.message };

  const uid = auth.user?.id;
  if (uid) {
    // skills may be strings (legacy) or { name, level } objects
    const skillList = (data.skills || []).map((s) => (typeof s === "string" ? { name: s, level: "Basic" } : s));

    // Core fields (exist pre-v2) — must always save.
    await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        username: data.username,
        university: data.university || "SUTD",
        major: data.major || null,
        year: data.year || null,
        personality: data.personality || null,
        prefer_working: data.prefer_working || null,
        best_work_time: data.best_work_time || null,
        location: data.location || null,
        skills: skillList.map((s) => s.name),
        interests: data.interests || [],
      })
      .eq("id", uid);

    // v2-only column — separate call so a missing column can't reject the core update.
    if (data.gender) {
      await supabase.from("profiles").update({ gender: data.gender }).eq("id", uid).then(() => {}, () => {});
    }

    // proficiency detail — needs the v2 migration; ignore if the table isn't there yet
    if (skillList.length) {
      await supabase
        .from("user_skills")
        .insert(skillList.map((s) => ({ user_id: uid, skill_name: s.name, proficiency: s.level })))
        .then(() => {}, () => {});
    }
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
