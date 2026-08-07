import Link from "next/link";
import AppShell from "@/components/AppShell";
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
// Private) it also shows was owner-decided CLOSED on 2026-08-07 — not building
// it, not deferred, see HANDOFF.
export default async function PrivacyPage() {
  const prefs = await getPrefs();

  return (
    <AppShell>
      <div className="min-h-full pb-8" style={{ background: "#f9f8fb" }}>
        <div className="flex items-center gap-3 px-6">
          <Link href="/settings" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Privacy</h1>
        </div>
        <p className="mt-2 px-6 text-[12.5px] text-muted">Control who can see your profile and activity.</p>

        <PrivacyForm prefs={prefs} />
      </div>
    </AppShell>
  );
}
