"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { savePastProject } from "@/lib/pastProjects";

export async function signIn(_prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase's own wording ("Invalid login credentials") doesn't match the
    // Welcome Page export's copy — map the one case that matters to users.
    if (error.status === 400) return { error: "Incorrect email or password. Try again." };
    return { error: error.message };
  }

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

  // No school-email requirement — any email works, signup never blocks on
  // this. But `university` is derived from the email domain ONLY, never
  // free text: the "Restricted" privacy tier's RLS policy (schema_v13.sql)
  // trusts this column to mean "actually verified same school" — a
  // free-text fallback would let anyone type "SUTD" and pass that check
  // with an unrelated email. Unmatched domains just get null, meaning they
  // won't match any Restricted project — a real, honest degrade, not a
  // spoofable one.
  const emailDomain = (data.email || "").split("@")[1]?.toLowerCase();
  const { data: uniRow } = emailDomain
    ? await supabase.from("university_domains").select("university").eq("domain", emailDomain).maybeSingle()
    : { data: null };
  const university = uniRow?.university || null;

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
        university: university,
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
        has_completed_onboarding_tour: false,
      })
      .eq("id", uid);

    // Step 6 "Add Project" entries — no project exists yet at signup time,
    // so these save as freestanding past_projects rows (project_id null).
    if ((data.pending_projects || []).length) {
      await Promise.all(
        data.pending_projects.map((p) => savePastProject(supabase, { userId: uid, role: p.role, writeUp: p.write_up }))
      ).catch(() => {});
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
