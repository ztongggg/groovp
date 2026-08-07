import AppShell from "@/components/AppShell";
import EditSkillsForm from "@/components/EditSkillsForm";
import { createClient } from "@/lib/supabase/server";

async function getSkills() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    // Prefer per-skill proficiency (user_skills); fall back to plain names.
    try {
      const { data: us } = await supabase.from("user_skills").select("skill_name, proficiency").eq("user_id", user.id);
      if (us?.length) return us.map((r) => ({ name: r.skill_name, level: r.proficiency || "Basic" }));
    } catch {}
    const { data: p } = await supabase.from("profiles").select("skills").eq("id", user.id).single();
    return (p?.skills || []).map((n) => ({ name: n, level: "Basic" }));
  } catch {
    return [];
  }
}

export default async function EditSkillsPage() {
  const skills = await getSkills();
  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <EditSkillsForm initial={skills} />
      </div>
    </AppShell>
  );
}
