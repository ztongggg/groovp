import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import PrivacyForm from "@/components/PrivacyForm";
import { createClient } from "@/lib/supabase/server";

async function getPrefs() {
  const fallback = { show_ratings_publicly: true, allow_message_first: true };
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fallback;
    const { data } = await supabase.from("profiles").select("show_ratings_publicly, allow_message_first").eq("id", user.id).single();
    return {
      show_ratings_publicly: data?.show_ratings_publicly !== false,
      allow_message_first: data?.allow_message_first !== false,
    };
  } catch {
    return fallback;
  }
}

// Scoped to the 2 concretely-specifiable, enforceable toggles from the Figma
// Privacy screen. The 3-tier profile-visibility selector (Public/Teammates-only/
// Private) it also showed is NOT built — no spec guidance on enforcement scope
// (which queries/surfaces would need to filter by it), see HANDOFF.
export default async function PrivacyPage() {
  const prefs = await getPrefs();

  return (
    <AppShell>
      <div className="min-h-full bg-bgapp pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/settings" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Privacy</h1>
        </div>

        <PrivacyForm prefs={prefs} />
      </div>
    </AppShell>
  );
}
