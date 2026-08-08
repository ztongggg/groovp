import AppShell from "@/components/AppShell";
import ProfileView from "@/components/ProfileView";
import { createClient } from "@/lib/supabase/server";
import { profileCompleteness } from "@/lib/completeness";
import { getExperimentCondition } from "@/lib/experiment"; // EXPERIMENT: see lib/experiment.js

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
      const { data: pp } = await supabase.from("past_projects").select("id, role, write_up, photos, created_at, project_id").eq("user_id", user.id).order("created_at", { ascending: false });
      const projIds = (pp || []).map((r) => r.project_id).filter(Boolean);
      let projById = {};
      if (projIds.length) {
        const { data: projs } = await supabase.from("projects").select("id, name, timeline_start, timeline_end").in("id", projIds);
        projById = Object.fromEntries((projs || []).map((p) => [p.id, p]));
      }
      pastProjects = (pp || []).map((r) => ({ ...r, project: r.project_id ? projById[r.project_id] : null }));
    } catch {}

    const subtitleParts = [p?.year, p?.major, p?.university || "SUTD"].filter(Boolean);

    return {
      userId: user.id,
      name: p?.full_name || emailName,
      username: p?.username || emailName,
      subtitle: subtitleParts.join(" · "),
      avatarUrl: p?.avatar_url || "",
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
      linkedinVerified: !!p?.linkedin_verified,
      githubVerified: !!p?.github_verified,
      linkedinUrl: p?.linkedin_url || "",
      githubUrl: p?.github_url || "",
      portfolioUrl: p?.portfolio_url || "",
      completeness: profileCompleteness(p),
    };
  } catch {
    return fallback;
  }
}

export default async function ProfilePage() {
  const data = await getProfile();
  const condition = await getExperimentCondition(); // EXPERIMENT: see lib/experiment.js
  return (
    <AppShell>
      <ProfileView {...data} hidePersonality={condition === "neutral"} />
    </AppShell>
  );
}
