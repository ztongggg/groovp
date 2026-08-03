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
    const { data: p } = await supabase.from("profiles").select("full_name, username, university, major, year, personality, prefer_working, best_work_time, location").eq("id", user.id).single();
    return p || {};
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
