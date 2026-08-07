import ChatView from "@/components/ChatView";
import { createClient } from "@/lib/supabase/server";

async function getData(groupId) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: g } = await supabase
      .from("groups")
      .select("name, projects(name, status)")
      .eq("id", groupId)
      .single();

    // Member avatars sit in the header as an overlapping stack.
    const { data: members } = await supabase.from("group_members").select("user_id").eq("group_id", groupId);
    const memberIds = (members || []).map((m) => m.user_id);
    let profById = {};
    if (memberIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, username, avatar_url").in("id", memberIds);
      profById = Object.fromEntries((profs || []).map((p) => [p.id, p]));
    }
    const memberCount = memberIds.length;

    const { data: msgs } = await supabase
      .from("messages")
      .select("id, body, sender_id, created_at, profiles:sender_id(full_name, username, avatar_url)")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    // Opening the chat marks it read — this is what clears the Teams unread badge.
    if (user) {
      try {
        await supabase
          .from("group_members")
          .update({ last_read_at: new Date().toISOString() })
          .eq("group_id", groupId)
          .eq("user_id", user.id);
      } catch {}
    }

    return {
      title: g?.name || "Chat",
      subtitle: [memberCount ? `${memberCount} member${memberCount === 1 ? "" : "s"}` : null, g?.projects?.name].filter(Boolean).join(" · "),
      meId: user?.id || null,
      avatars: memberIds.slice(0, 3).map((id) => ({ url: profById[id]?.avatar_url || "" })),
      archived: g?.projects?.status === "Deleted",
      messages: (msgs || []).map((m) => ({
        id: m.id,
        body: m.body,
        sender_id: m.sender_id,
        created_at: m.created_at,
        name: m.profiles?.full_name || m.profiles?.username || "User",
        avatarUrl: m.profiles?.avatar_url || "",
      })),
    };
  } catch {
    return { title: "Chat", subtitle: "", meId: null, messages: [], avatars: [], archived: false };
  }
}

export default async function ChatPage({ params }) {
  const { title, subtitle, meId, messages, avatars, archived } = await getData(params.groupId);
  return (
    <ChatView
      groupId={params.groupId}
      title={title}
      subtitle={subtitle}
      infoHref={`/groups/${params.groupId}`}
      avatars={avatars}
      meId={meId}
      messages={messages}
      archived={archived}
    />
  );
}
