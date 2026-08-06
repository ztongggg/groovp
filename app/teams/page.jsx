import AppShell from "@/components/AppShell";
import TeamsView from "@/components/TeamsView";
import { createClient } from "@/lib/supabase/server";

function relTime(iso) {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Applied today";
  if (days === 1) return "Applied 1 day ago";
  if (days < 7) return `Applied ${days} days ago`;
  const w = Math.floor(days / 7);
  return w === 1 ? "Applied 1 week ago" : `Applied ${w} weeks ago`;
}

// Compact inbox stamp — "2m", "1h", "3h", "1d", "2w" as the design shows.
function shortTime(iso) {
  if (!iso) return "";
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

async function getData() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { requests: [], teams: [] };

    const { data: reqs } = await supabase
      .from("join_requests")
      .select("id,status,created_at, groups(name, photo_url, projects(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const requests = (reqs || []).filter((r) => r.status !== "invited").map((r) => ({
      id: r.id,
      status: r.status,
      title: r.groups?.projects?.name || "Project",
      subtitle: r.groups?.name || "Group",
      applied: relTime(r.created_at),
      photoUrl: r.groups?.photo_url || null,
    }));

    const { data: mem } = await supabase
      .from("group_members")
      .select("group_id, last_read_at, groups(id, name, photo_url, status, projects(name))")
      .eq("user_id", user.id);

    // Last message + unread count per group. Fetched as one flat query and
    // folded in JS — nested embeds are unreliable on Vercel (see HANDOFF).
    const groupIds = (mem || []).map((m) => m.group_id).filter(Boolean);
    const lastByGroup = {};
    const unreadByGroup = {};
    const senderIds = new Set();
    if (groupIds.length) {
      try {
        const { data: msgs } = await supabase
          .from("messages")
          .select("group_id, sender_id, body, created_at")
          .in("group_id", groupIds)
          .order("created_at", { ascending: false })
          .limit(500);
        const readAt = Object.fromEntries((mem || []).map((m) => [m.group_id, m.last_read_at]));
        for (const msg of msgs || []) {
          if (!lastByGroup[msg.group_id]) {
            lastByGroup[msg.group_id] = msg;
            senderIds.add(msg.sender_id);
          }
          const seenBefore = readAt[msg.group_id];
          if (msg.sender_id !== user.id && (!seenBefore || msg.created_at > seenBefore)) {
            unreadByGroup[msg.group_id] = (unreadByGroup[msg.group_id] || 0) + 1;
          }
        }
      } catch {}
    }

    let senderNames = {};
    if (senderIds.size) {
      try {
        const { data: profs } = await supabase.from("profiles").select("id, full_name, username").in("id", [...senderIds]);
        senderNames = Object.fromEntries((profs || []).map((p) => [p.id, (p.full_name || p.username || "Someone").split(" ")[0]]));
      } catch {}
    }

    const preview = (msg) => {
      if (!msg) return null;
      const who = msg.sender_id === user.id ? "You" : senderNames[msg.sender_id] || "Someone";
      return `${who}: ${msg.body}`;
    };

    const teams = (mem || []).map((m) => {
      const last = lastByGroup[m.group_id];
      const ended = m.groups?.status === "Ended";
      return {
        id: m.groups?.id || m.group_id,
        title: m.groups?.projects?.name || "Project",
        subtitle: ended ? "Project ended" : preview(last) || m.groups?.name || "Group",
        kind: "group",
        photoUrl: m.groups?.photo_url || null,
        time: shortTime(last?.created_at),
        unread: ended ? 0 : unreadByGroup[m.group_id] || 0,
        ended,
        sortAt: last?.created_at || "",
      };
    });

    // private conversations (merged into the inbox per spec)
    let dms = [];
    try {
      const { data: myParts } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", user.id);
      const convIds = (myParts || []).map((r) => r.conversation_id);
      if (convIds.length) {
        const { data: convs } = await supabase.from("conversations").select("id").eq("type", "private").in("id", convIds);
        const privIds = (convs || []).map((c) => c.id);
        if (privIds.length) {
          const { data: others } = await supabase.from("conversation_participants").select("conversation_id, user_id").in("conversation_id", privIds).neq("user_id", user.id);
          const otherIds = [...new Set((others || []).map((o) => o.user_id))];
          const { data: profs } = await supabase.from("profiles").select("id, full_name, username").in("id", otherIds);
          const pmap = Object.fromEntries((profs || []).map((p) => [p.id, p.full_name || p.username || "User"]));

          // my last_read_at per conversation, for the unread badge
          const myRead = Object.fromEntries(
            (myParts || []).map((r) => [r.conversation_id, r.last_read_at])
          );

          const lastByConv = {};
          const unreadByConv = {};
          try {
            const { data: msgs } = await supabase
              .from("messages")
              .select("conversation_id, sender_id, body, created_at")
              .in("conversation_id", privIds)
              .order("created_at", { ascending: false })
              .limit(500);
            for (const msg of msgs || []) {
              if (!lastByConv[msg.conversation_id]) lastByConv[msg.conversation_id] = msg;
              const seenBefore = myRead[msg.conversation_id];
              if (msg.sender_id !== user.id && (!seenBefore || msg.created_at > seenBefore)) {
                unreadByConv[msg.conversation_id] = (unreadByConv[msg.conversation_id] || 0) + 1;
              }
            }
          } catch {}

          dms = (others || []).map((o) => {
            const last = lastByConv[o.conversation_id];
            const name = pmap[o.user_id] || "User";
            return {
              id: o.conversation_id,
              title: name,
              subtitle: last
                ? `${last.sender_id === user.id ? "You" : name.split(" ")[0]}: ${last.body}`
                : "Direct message",
              kind: "dm",
              time: shortTime(last?.created_at),
              unread: unreadByConv[o.conversation_id] || 0,
              sortAt: last?.created_at || "",
            };
          });
        }
      }
    } catch {}

    // Most recent conversation first, exactly as an inbox behaves.
    const inbox = [...teams, ...dms].sort((a, b) => (b.sortAt || "").localeCompare(a.sortAt || ""));

    return { requests, teams: inbox };
  } catch {
    return { requests: [], teams: [] };
  }
}

export default async function TeamsPage() {
  const { requests, teams } = await getData();
  return (
    <AppShell>
      <TeamsView requests={requests} teams={teams} />
    </AppShell>
  );
}
