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
    if (otherId) {
      const { data: prof } = await supabase.from("profiles").select("full_name, username").eq("id", otherId).single();
      title = prof?.full_name || prof?.username || "Chat";
    }

    const { data: msgs } = await supabase
      .from("messages")
      .select("id, body, sender_id, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    return { title, meId: user?.id || null, messages: (msgs || []).map((m) => ({ id: m.id, body: m.body, sender_id: m.sender_id, created_at: m.created_at, name: "" })) };
  } catch {
    return { title: "Chat", meId: null, messages: [] };
  }
}

export default async function DMPage({ params }) {
  const { title, meId, messages } = await getData(params.conversationId);
  return <ChatView conversationId={params.conversationId} title={title} meId={meId} messages={messages} backHref="/teams" />;
}
