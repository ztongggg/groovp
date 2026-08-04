import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth return point. Used by LinkedIn identity-linking (Connect LinkedIn).
// Exchanges the code for a session, then — if a LinkedIn identity is now
// attached to the user — marks the profile as verified.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/settings";
  const errorDesc = searchParams.get("error_description");

  if (errorDesc) {
    return NextResponse.redirect(`${origin}${next}?linkedin=error`);
  }

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const li = user?.identities?.find((i) => i.provider === "linkedin_oidc");
        if (user && li) {
          await supabase
            .from("profiles")
            .update({ linkedin_verified: true, linkedin_sub: li.identity_data?.sub || li.id || null })
            .eq("id", user.id);
        }
      } catch {}
      return NextResponse.redirect(`${origin}${next}?linkedin=connected`);
    }
  }

  return NextResponse.redirect(`${origin}${next}?linkedin=error`);
}
