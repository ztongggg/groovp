import ChatView from "@/components/ChatView";
import { createClient } from "@/lib/supabase/server";

async function getData(convId) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // other participant's name for the title (two plain queries, no embeds)
    const { data: parts } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", convId);
    const otherId = (parts || []).map((p) => p.user_id).find((id) => id !== user?.id);
    let title = "Chat";
    let subtitle = "";
    let avatars = [];
    if (otherId) {
      const { data: prof } = await supabase.from("profiles").select("full_name, username, avatar_url, year, major").eq("id", otherId).single();
      title = prof?.full_name || prof?.username || "Chat";
      // The Figma frame shows a relationship line ("Applicant · <project>").
      // There is no single relationship to derive here, so this shows who they
      // are instead of inventing a status that might not be true.
      subtitle = [prof?.year, prof?.major].filter(Boolean).join(" · ") || (prof?.username ? `@${prof.username}` : "");
      avatars = [{ url: prof?.avatar_url || "" }];
    }

    const { data: msgs } = await supabase
      .from("messages")
      .select("id, body, sender_id, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    // Opening the DM marks it read, clearing its Teams unread badge.
    if (user) {
      try {
        await supabase
          .from("conversation_participants")
          .update({ last_read_at: new Date().toISOString() })
          .eq("conversation_id", convId)
          .eq("user_id", user.id);
      } catch {}
    }

    return { title, subtitle, avatars, otherId: otherId || null, meId: user?.id || null, messages: (msgs || []).map((m) => ({ id: m.id, body: m.body, sender_id: m.sender_id, created_at: m.created_at, name: "" })) };
  } catch {
    return { title: "Chat", subtitle: "", avatars: [], otherId: null, meId: null, messages: [] };
  }
}

export default async function DMPage({ params }) {
  const { title, subtitle, avatars, otherId, meId, messages } = await getData(params.conversationId);
  return (
    <ChatView
      conversationId={params.conversationId}
      title={title}
      subtitle={subtitle}
      infoHref={otherId ? `/u/${otherId}` : null}
      avatars={avatars}
      meId={meId}
      messages={messages}
      backHref="/teams"
    />
  );
}
