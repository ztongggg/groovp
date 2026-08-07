import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth return point for identity-linking (Connect LinkedIn / GitHub).
// Exchanges the code for a session, then syncs the verified flags from whatever
// identities are now attached to the user.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/profile";
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
          const { data: existing } = await supabase.from("profiles").select("github_url").eq("id", user.id).maybeSingle();
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
            const username = gh.identity_data?.user_name || gh.identity_data?.preferred_username || null;
            patch.github_username = username;
            // Verifying proves the account is real — if the user never typed a
            // GitHub URL, don't leave the profile with a verified badge and
            // nothing to show for it. LinkedIn's OIDC identity has no public
            // vanity URL to derive the same way.
            if (username && !existing?.github_url) patch.github_url = `https://github.com/${username}`;
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
