"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addPastProject(_prev, formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const role = (formData.get("role") || "").toString().trim();
  const write_up = (formData.get("write_up") || "").toString().trim();
  if (!role) return { error: "Add a title / your role." };

  const { error } = await supabase
    .from("past_projects")
    .insert({ user_id: user.id, role, write_up: write_up || null });
  if (error) return { error: error.message };

  revalidatePath("/profile");
  redirect("/profile");
}
