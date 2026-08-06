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
      .select("name, projects(name)")
      .eq("id", groupId)
      .single();

    const { count: memberCount } = await supabase
      .from("group_members")
      .select("user_id", { count: "exact", head: true })
      .eq("group_id", groupId);

    const { data: msgs } = await supabase
      .from("messages")
      .select("id, body, sender_id, created_at, profiles:sender_id(full_name, username)")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    return {
      title: g?.name || "Chat",
      subtitle: [memberCount ? `${memberCount} member${memberCount === 1 ? "" : "s"}` : null, g?.projects?.name].filter(Boolean).join(" · "),
      meId: user?.id || null,
      messages: (msgs || []).map((m) => ({
        id: m.id,
        body: m.body,
        sender_id: m.sender_id,
        created_at: m.created_at,
        name: m.profiles?.full_name || m.profiles?.username || "User",
      })),
    };
  } catch {
    return { title: "Chat", subtitle: "", meId: null, messages: [] };
  }
}

export default async function ChatPage({ params }) {
  const { title, subtitle, meId, messages } = await getData(params.groupId);
  return <ChatView groupId={params.groupId} title={title} subtitle={subtitle} meId={meId} messages={messages} />;
}
