import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import NotificationPrefsForm from "@/components/NotificationPrefsForm";
import { createClient } from "@/lib/supabase/server";

async function getPrefs() {
  const fallback = { notify_join_requests: true, notify_join_accepted: true, notify_invites: true, notify_new_message: true, notify_rate_reminder: true };
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return fallback;
    const { data } = await supabase.from("profiles").select("notify_join_requests, notify_join_accepted, notify_invites, notify_new_message, notify_rate_reminder").eq("id", user.id).single();
    return {
      notify_join_requests: data?.notify_join_requests !== false,
      notify_join_accepted: data?.notify_join_accepted !== false,
      notify_invites: data?.notify_invites !== false,
      notify_new_message: data?.notify_new_message !== false,
      notify_rate_reminder: data?.notify_rate_reminder !== false,
    };
  } catch {
    return fallback;
  }
}

export default async function NotificationPreferencesPage() {
  const prefs = await getPrefs();

  return (
    <AppShell>
      <div className="min-h-full pb-8" style={{ background: "#f9f8fb" }}>
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/settings" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Notification Preferences</h1>
        </div>
        <p className="mt-2 px-6 text-[12.5px] text-muted">Choose what you want to be notified about.</p>

        <NotificationPrefsForm prefs={prefs} />
      </div>
    </AppShell>
  );
}
