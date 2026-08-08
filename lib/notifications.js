"use server";

import { createClient } from "@/lib/supabase/server";

// Polled by NotificationToast — just the single most recent row, so the
// client can tell "a new one arrived" from a change in id/created_at
// without pulling the whole list on every tick.
export async function getLatestNotification() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("notifications")
    .select("id, body, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}
