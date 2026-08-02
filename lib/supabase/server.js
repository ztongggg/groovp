import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client (use in Server Components, Route Handlers,
// and Server Actions).
export function createClient() {
  const cookieStore = cookies();

  // Bracket access → read the runtime value Vercel injects (not build-inlined),
  // so a build made before the env vars existed still works.
  return createServerClient(
    process.env["NEXT_PUBLIC_SUPABASE_URL"],
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component — safe to ignore, middleware
            // refreshes the session cookie.
          }
        },
      },
    }
  );
}
