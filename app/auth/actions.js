"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signUp(_prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const full_name = formData.get("full_name");
  const username = formData.get("username");

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, username } },
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/home");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
