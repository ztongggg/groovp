"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { savePastProject } from "@/lib/pastProjects";

export async function addPastProject(_prev, formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const role = (formData.get("role") || "").toString();
  const write_up = (formData.get("write_up") || "").toString();

  const res = await savePastProject(supabase, { userId: user.id, role, writeUp: write_up });
  if (res?.error) return { error: res.error };

  revalidatePath("/profile");
  redirect("/profile");
}
