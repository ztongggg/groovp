"use server";

import { createClient } from "@/lib/supabase/server";

export async function requestReset(_prev, formData) {
  const email = (formData.get("email") || "").toString().trim();
  if (!email) return { error: "Enter your email." };

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { error: error.message };
  return { ok: true };
}
