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
  };
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return fallback;

    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const { data: ratings } = await supabase.from("ratings").select("stars").eq("ratee_id", user.id);

    const count = ratings?.length || 0;
    const avg = count ? (ratings.reduce((s, r) => s + r.stars, 0) / count).toFixed(1) : null;
    const emailName = (user.email || "student").split("@")[0];

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
      skills: p?.skills || [],
      interests: p?.interests || [],
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
