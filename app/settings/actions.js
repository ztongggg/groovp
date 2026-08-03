"use server";

import { createClient } from "@/lib/supabase/server";

export async function changePassword(_prevState, formData) {
  const password = (formData.get("password") || "").toString();
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { ok: true };
}
