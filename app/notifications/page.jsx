import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import { createClient } from "@/lib/supabase/server";

function relTime(iso) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h / 24);
  return `${dd}d ago`;
}

const ICON = {
  join_accepted: { bg: "#d4f2de", stroke: "#298c52", d: "M5 12l5 5L20 6" },
  new_join_requests: { bg: "#ece8fc", stroke: "#7c3aed", d: "M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20c0-3 2.5-5 5-5s5 2 5 5" },
  new_message: { bg: "#dcebff", stroke: "#0a66c2", d: "M20 12a8 8 0 0 1-11.5 7.2L4 20l.8-4.5A8 8 0 1 1 20 12Z" },
  rate_reminder: { bg: "#fce5b8", stroke: "#99730d", d: "m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.3l6-.7L12 3Z" },
  invite: { bg: "#ece8fc", stroke: "#7c3aed", d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6" },
};

// Notifications that deep-link somewhere when tapped.
const HREF = { invite: "/invites" };

async function getNotifs() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from("notifications")
      .select("id,type,body,read,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    // mark all read on view
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false).then(() => {}, () => {});
    return data || [];
  } catch {
    return [];
  }
}

export default async function NotificationsPage() {
  const notifs = await getNotifs();

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/home" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Notifications</h1>
        </div>

        {notifs.length === 0 ? (
          <div className="mt-16 flex flex-col items-center px-8 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/empty-notif.png" alt="" className="mb-4 h-36 w-36" />
            <p className="text-[16px] font-semibold text-navy">You're all caught up</p>
            <p className="mt-1 text-[14px] text-muted">New activity on your projects shows up here.</p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2 px-5">
            {notifs.map((n) => {
              const ic = ICON[n.type] || ICON.new_message;
              const href = HREF[n.type];
              const inner = (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: ic.bg }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ic.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={ic.d} /></svg>
                  </span>
                  <p className="flex-1 text-[14px] text-navy">{n.body}</p>
                  <span className="shrink-0 text-[12px] text-muted">{relTime(n.created_at)}</span>
                </>
              );
              const cls = "flex items-center gap-3 rounded-2xl border border-line p-4";
              const bg = { background: n.read ? "#fff" : "#faf9ff" };
              return href ? (
                <Link key={n.id} href={href} className={cls} style={bg}>{inner}</Link>
              ) : (
                <div key={n.id} className={cls} style={bg}>{inner}</div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
