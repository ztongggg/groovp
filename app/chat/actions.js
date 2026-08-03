"use server";

import { createClient } from "@/lib/supabase/server";

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

  return { ok: true };
}
