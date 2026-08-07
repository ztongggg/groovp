import AppShell from "@/components/AppShell";
import EditBasicsForm from "@/components/EditBasicsForm";
import { createClient } from "@/lib/supabase/server";

async function getProfile() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};
    const { data: p } = await supabase.from("profiles").select("full_name, username, avatar_url, bio, university, major, year, personality, prefer_working, best_work_time, location").eq("id", user.id).single();
    return p || {};
  } catch {
    return {};
  }
}

export default async function EditProfilePage() {
  const profile = await getProfile();
  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <EditBasicsForm initial={profile} />
      </div>
    </AppShell>
  );
}
