import Link from "next/link";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

// Compact stamps — "2h", "1d", "2w" — matching the Figma frame.
function relTime(iso) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  const dd = Math.floor(h / 24);
  if (dd < 7) return `${dd}d`;
  return `${Math.floor(dd / 7)}w`;
}

const KIND = {
  join_accepted: { bg: "#D9F2E0", stroke: "#298c52", sub: "Your request was accepted", d: "M5 13l4 4L19 7" },
  join_declined: { bg: "#FCDEDE", stroke: "#bf4247", sub: "Your request was not accepted", d: "M18 6 6 18M6 6l12 12" },
  new_join_requests: { bg: "#C4B5FD", stroke: "#3a1e83", sub: "Needs your review", d: "M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20c0-3 2.5-5 5-5s5 2 5 5" },
  new_message: { bg: "#ECE8FC", stroke: "#7c3aed", sub: "Tap to open the chat", d: "M20 12a8 8 0 0 1-11.5 7.2L4 20l.8-4.5A8 8 0 1 1 20 12Z" },
  rate_reminder: { bg: "#FCE5B8", stroke: "#99730d", sub: "Leave a rating for your teammates", d: "m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.3l6-.7L12 3Z" },
  invite: { bg: "#ECE8FC", stroke: "#7c3aed", sub: "You've been invited to join", d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6" },
};

// Notifications that deep-link somewhere when tapped.
const STATIC_HREF = { invite: "/invites", new_join_requests: "/applicants", join_accepted: "/teams", join_declined: "/teams" };

async function getNotifs() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
      .from("notifications")
      .select("id,type,body,read,created_at,related_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    // mark all read on view
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false).then(() => {}, () => {});

    // new_message's related_id is either a group id (group chat) or a conversation
    // id (DM) — resolve which, so the click routes to /chat/[id] vs /dm/[id].
    const msgIds = (data || []).filter((n) => n.type === "new_message" && n.related_id).map((n) => n.related_id);
    let groupIdSet = new Set();
    if (msgIds.length) {
      const { data: groups } = await supabase.from("groups").select("id").in("id", msgIds);
      groupIdSet = new Set((groups || []).map((g) => g.id));
    }

    return (data || []).map((n) => ({
      ...n,
      href:
        n.type === "new_message" && n.related_id
          ? groupIdSet.has(n.related_id) ? `/chat/${n.related_id}` : `/dm/${n.related_id}`
          : n.type === "rate_reminder" && n.related_id
            ? `/groups/${n.related_id}/rate`
            : STATIC_HREF[n.type],
    }));
  } catch {
    return [];
  }
}

export default async function NotificationsPage() {
  const notifs = await getNotifs();

  return (
    <AppShell>
      <div className="min-h-full pb-6" style={{ background: "#f9f8fb" }}>
        <div className="flex items-center gap-3 px-6">
          <Link href="/home" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1d1b44" }}>Updates</h1>
        </div>

        {notifs.length === 0 ? (
          <div style={{ marginTop: 90, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 32px", textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/empty-notif.png" alt="" style={{ width: 220, height: 220, objectFit: "contain" }} />
            <p style={{ marginTop: 24, fontSize: 19, fontWeight: 800, color: "#1D1B44" }}>You&apos;re all caught up!</p>
            <p style={{ marginTop: 10, fontSize: 12.5, color: "#757080", lineHeight: "18px" }}>No new updates right now.<br />We&apos;ll let you know when something happens.</p>
          </div>
        ) : (
          <div style={{ marginTop: 18, padding: "0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
            {notifs.map((n) => {
              const k = KIND[n.type] || KIND.new_message;
              const inner = (
                <>
                  <span style={{ width: 40, height: 40, borderRadius: 9999, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={k.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={k.d} /></svg>
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1D1B44", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</span>
                    <span style={{ display: "block", fontSize: 11.5, color: "#757080", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.sub}</span>
                  </span>
                  <span style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ fontSize: 10.5, color: "#757080" }}>{relTime(n.created_at)}</span>
                    {!n.read && <span style={{ width: 6, height: 6, borderRadius: 9999, background: "#7C3AED" }} />}
                  </span>
                </>
              );
              const rowStyle = { height: 68, background: "#fff", border: "1px solid #F3F1F8", borderRadius: 16, boxShadow: "0px 2px 8px rgba(26,20,51,0.06)", display: "flex", alignItems: "center", gap: 12, padding: "0 12px" };
              return n.href ? (
                <Link key={n.id} href={n.href} style={rowStyle}>{inner}</Link>
              ) : (
                <div key={n.id} style={rowStyle}>{inner}</div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
