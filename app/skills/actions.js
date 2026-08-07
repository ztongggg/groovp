"use server";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SKILLS } from "@/lib/skillCatalog";

// Read the shared skill catalog. Falls back to the static default list on any
// failure (missing table pre-migration, RLS hiccup, etc.) so every picker
// still has something to show.
export async function getSkillCatalog() {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("skill_catalog").select("name").order("name");
    const names = (data || []).map((r) => r.name);
    return names.length ? Array.from(new Set([...DEFAULT_SKILLS, ...names])) : DEFAULT_SKILLS;
  } catch {
    return DEFAULT_SKILLS;
  }
}

// "If the database doesn't have the skill, they can add it" — a user typing a
// skill nobody's used before adds it to the shared catalog for everyone else's
// picker, not just their own profile.
export async function addCustomSkill(name) {
  const clean = (name || "").trim();
  if (!clean || clean.length > 40) return { error: "Invalid skill name." };
  try {
    const supabase = createClient();
    await supabase.from("skill_catalog").upsert({ name: clean }, { onConflict: "name" });
    return { ok: true };
  } catch {
    // Non-critical — the caller already added it to the user's own selection
    // locally, so a failed catalog write shouldn't block anything.
    return { ok: true };
  }
}
