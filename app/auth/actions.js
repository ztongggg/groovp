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

  // University is derived from the email domain, not user-entered — the
  // allowlist is also what makes the "Restricted" (same-school) privacy
  // tier meaningful. Reject unrecognized domains before creating the account.
  const emailDomain = (data.email || "").split("@")[1]?.toLowerCase();
  const { data: uniRow } = emailDomain
    ? await supabase.from("university_domains").select("university").eq("domain", emailDomain).maybeSingle()
    : { data: null };
  if (!uniRow) return { error: "Please sign up with your university email address." };

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
        university: uniRow.university,
        major: data.major || null,
        year: data.year || null,
        personality: data.personality || null,
        prefer_working: data.prefer_working || null,
        best_work_time: data.best_work_time || null,
        location: data.location || null,
        skills: skillList.map((s) => s.name),
        interests: data.interests || [],
        linkedin_url: data.linkedin_url || null,
        github_url: data.github_url || null,
        portfolio_url: data.portfolio_url || null,
      })
      .eq("id", uid);

    // Step 6 "Add Project" entries — no project exists yet at signup time,
    // so these save as freestanding past_projects rows (project_id null).
    if ((data.pending_projects || []).length) {
      await supabase
        .from("past_projects")
        .insert(data.pending_projects.map((p) => ({ user_id: uid, role: p.role || null, write_up: p.write_up || null })))
        .then(() => {}, () => {});
    }

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
