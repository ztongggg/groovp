import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth return point for identity-linking (Connect LinkedIn / GitHub).
// Exchanges the code for a session, then syncs the verified flags from whatever
// identities are now attached to the user.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/settings";
  const errorDesc = searchParams.get("error_description");

  if (errorDesc) {
    return NextResponse.redirect(`${origin}${next}?verify=error`);
  }

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const ids = user.identities || [];
          const li = ids.find((i) => i.provider === "linkedin_oidc");
          const gh = ids.find((i) => i.provider === "github");
          const patch = {};
          if (li) {
            patch.linkedin_verified = true;
            patch.linkedin_sub = li.identity_data?.sub || li.id || null;
          }
          if (gh) {
            patch.github_verified = true;
            patch.github_username = gh.identity_data?.user_name || gh.identity_data?.preferred_username || null;
          }
          if (Object.keys(patch).length) {
            await supabase.from("profiles").update(patch).eq("id", user.id);
          }
        }
      } catch {}
      return NextResponse.redirect(`${origin}${next}?verify=connected`);
    }
  }

  return NextResponse.redirect(`${origin}${next}?verify=error`);
}
