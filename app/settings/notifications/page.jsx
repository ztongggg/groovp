import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import NotificationPrefsForm from "@/components/NotificationPrefsForm";
import { createClient } from "@/lib/supabase/server";

async function getPrefs() {
  const fallback = { notify_join_requests: true, notify_join_accepted: true, notify_invites: true };
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fallback;
    const { data } = await supabase.from("profiles").select("notify_join_requests, notify_join_accepted, notify_invites").eq("id", user.id).single();
    return {
      notify_join_requests: data?.notify_join_requests !== false,
      notify_join_accepted: data?.notify_join_accepted !== false,
      notify_invites: data?.notify_invites !== false,
    };
  } catch {
    return fallback;
  }
}

export default async function NotificationPreferencesPage() {
  const prefs = await getPrefs();

  return (
    <AppShell>
      <div className="min-h-full bg-bgapp pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/settings" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Notification Preferences</h1>
        </div>
        <p className="mt-2 px-6 text-[12.5px] text-muted">Turn off any you don&apos;t want to be notified about — they still happen, you just won&apos;t get pinged.</p>

        <NotificationPrefsForm prefs={prefs} />
      </div>
    </AppShell>
  );
}
