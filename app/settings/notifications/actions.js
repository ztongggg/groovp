"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_KEYS = ["notify_join_requests", "notify_join_accepted", "notify_invites"];

export async function updateNotificationPrefs(key, value) {
  if (!ALLOWED_KEYS.includes(key)) return { error: "Unknown preference." };
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase.from("profiles").update({ [key]: value }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/settings/notifications");
  return { ok: true };
}
