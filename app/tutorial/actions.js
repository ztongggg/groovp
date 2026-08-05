"use server";

import { createClient } from "@/lib/supabase/server";

// Single shared exit point for all 3 places the tour can end (Tutorial 1 Skip,
// Tutorial 3 Skip, Tutorial 5 Get Started) — per spec's explicit recommendation,
// so completion logic doesn't drift across three separate implementations.
export async function completeOnboardingTour() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  await supabase.from("profiles").update({ has_completed_onboarding_tour: true }).eq("id", user.id);
  return { ok: true };
}
