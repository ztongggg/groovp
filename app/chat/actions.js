"use server";

import { createClient } from "@/lib/supabase/server";
import { shouldNotify } from "@/lib/notify";

export async function sendMessage(groupId, body) {
  const text = (body || "").trim();
  if (!text) return { error: "Empty message." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("messages")
    .insert({ group_id: groupId, sender_id: user.id, body: text });
  if (error) return { error: error.message };

  // Notify other group members (best-effort, gated per-recipient).
  try {
    const { data: members } = await supabase.from("group_members").select("user_id").eq("group_id", groupId).neq("user_id", user.id);
    if (members?.length) {
      const { data: me } = await supabase.from("profiles").select("full_name, username").eq("id", user.id).single();
      const { data: g } = await supabase.from("groups").select("name").eq("id", groupId).single();
      const nm = me?.full_name || me?.username || "Someone";
      const recipients = [];
      for (const m of members) {
        if (await shouldNotify(supabase, m.user_id, "notify_new_message")) recipients.push(m.user_id);
      }
      if (recipients.length) {
        await supabase.from("notifications").insert(
          recipients.map((uid) => ({ user_id: uid, type: "new_message", related_id: groupId, body: `${nm} in ${g?.name || "your group"}: ${text.slice(0, 80)}` }))
        );
      }
    }
  } catch {}

  return { ok: true };
}

export async function sendDM(conversationId, body) {
  const text = (body || "").trim();
  if (!text) return { error: "Empty message." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, body: text });
  if (error) return { error: error.message };

  // Notify the other participant (best-effort).
  try {
    const { data: others } = await supabase.from("conversation_participants").select("user_id").eq("conversation_id", conversationId).neq("user_id", user.id);
    const otherId = others?.[0]?.user_id;
    if (otherId && (await shouldNotify(supabase, otherId, "notify_new_message"))) {
      const { data: me } = await supabase.from("profiles").select("full_name, username").eq("id", user.id).single();
      const nm = me?.full_name || me?.username || "Someone";
      await supabase.from("notifications").insert({ user_id: otherId, type: "new_message", related_id: conversationId, body: `${nm}: ${text.slice(0, 80)}` });
    }
  } catch {}

  return { ok: true };
}

// Find or create a 1:1 private conversation, then return its id (no embeds).
export async function openPrivateChat(otherId) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (user.id === otherId) return { error: "That's you." };

  try {
    const { data: myParts } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", user.id);
    const myIds = (myParts || []).map((r) => r.conversation_id);
    let convId = null;
    if (myIds.length) {
      const { data: priv } = await supabase.from("conversations").select("id").eq("type", "private").in("id", myIds);
      const privIds = (priv || []).map((c) => c.id);
      if (privIds.length) {
        const { data: match } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", otherId).in("conversation_id", privIds);
        convId = match?.[0]?.conversation_id || null;
      }
    }
    if (!convId) {
      // Privacy: "allow others to message me first" gates starting a brand-new
      // conversation. An existing one (found above) is never affected.
      const { data: target } = await supabase.from("profiles").select("allow_message_first").eq("id", otherId).maybeSingle();
      if (target?.allow_message_first === false) {
        return { error: "This user isn't accepting new messages right now." };
      }
      const { data: conv, error } = await supabase.from("conversations").insert({ type: "private" }).select().single();
      if (error) return { error: error.message };
      convId = conv.id;
      await supabase.from("conversation_participants").insert([
        { conversation_id: convId, user_id: user.id },
        { conversation_id: convId, user_id: otherId },
      ]);
    }
    return { ok: true, conversationId: convId };
  } catch (e) {
    return { error: "Could not open chat." };
  }
}
