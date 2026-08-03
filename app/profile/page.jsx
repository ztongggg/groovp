import AppShell from "@/components/AppShell";
import ProfileView from "@/components/ProfileView";
import { createClient } from "@/lib/supabase/server";

async function getProfile() {
  const fallback = {
    name: "Student",
    username: "student",
    subtitle: "SUTD",
    ratingLabel: "New",
    ratingCount: 0,
    personality: {},
    skills: [],
    interests: [],
    pastProjects: [],
  };
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return fallback;

    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const { data: ratings } = await supabase.from("ratings").select("stars").eq("ratee_id", user.id);

    // skill proficiency (v2). Fall back to plain names if the table isn't there yet.
    let skills = (p?.skills || []).map((n) => ({ name: n, level: null }));
    try {
      const { data: us } = await supabase.from("user_skills").select("skill_name, proficiency").eq("user_id", user.id);
      if (us?.length) skills = us.map((r) => ({ name: r.skill_name, level: r.proficiency }));
    } catch {}

    const count = ratings?.length || 0;
    const avg = count ? (ratings.reduce((s, r) => s + r.stars, 0) / count).toFixed(1) : null;
    const emailName = (user.email || "student").split("@")[0];

    let pastProjects = [];
    try {
      const { data: pp } = await supabase.from("past_projects").select("id, role, write_up, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
      pastProjects = pp || [];
    } catch {}

    const subtitleParts = [p?.year, p?.major, p?.university || "SUTD"].filter(Boolean);

    return {
      name: p?.full_name || emailName,
      username: p?.username || emailName,
      subtitle: subtitleParts.join(" · "),
      ratingLabel: avg || "New",
      ratingCount: count,
      personality: {
        personality: p?.personality,
        prefer_working: p?.prefer_working,
        best_work_time: p?.best_work_time,
        location: p?.location,
      },
      skills,
      interests: p?.interests || [],
      pastProjects,
    };
  } catch {
    return fallback;
  }
}

export default async function ProfilePage() {
  const data = await getProfile();
  return (
    <AppShell>
      <ProfileView {...data} />
    </AppShell>
  );
}
