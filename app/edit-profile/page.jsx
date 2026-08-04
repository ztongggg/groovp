import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import EditProfileForm from "@/components/EditProfileForm";
import { createClient } from "@/lib/supabase/server";

async function getProfile() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};
    const { data: p } = await supabase.from("profiles").select("full_name, username, university, major, year, personality, prefer_working, best_work_time, location, skills, interests").eq("id", user.id).single();

    // Prefer per-skill proficiency (user_skills); fall back to plain names.
    let skills = (p?.skills || []).map((n) => ({ name: n, level: "Basic" }));
    try {
      const { data: us } = await supabase.from("user_skills").select("skill_name, proficiency").eq("user_id", user.id);
      if (us?.length) skills = us.map((r) => ({ name: r.skill_name, level: r.proficiency || "Basic" }));
    } catch {}

    return { ...(p || {}), skills, interests: p?.interests || [] };
  } catch {
    return {};
  }
}

export default async function EditProfilePage() {
  const initial = await getProfile();
  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <StatusBar />
        <div className="mb-4 flex items-center gap-3 px-6">
          <Link href="/profile" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>Edit profile</h1>
        </div>
        <EditProfileForm initial={initial} />
      </div>
    </AppShell>
  );
}
