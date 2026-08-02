// Diagnostic only — reports whether Supabase env vars reached this deployment.
// Presence + length only, never the values. Safe to remove once auth works.
// `dot*` = build-time inlined value; `runtime*` = value Vercel injects at
// runtime (bracket access is NOT inlined by Next).
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    dotUrlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    dotKeyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    runtimeUrlPresent: !!process.env["NEXT_PUBLIC_SUPABASE_URL"],
    runtimeKeyPresent: !!process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    runtimeUrlLength: (process.env["NEXT_PUBLIC_SUPABASE_URL"] || "").length,
    runtimeKeyLength: (process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || "").length,
    nodeEnv: process.env.NODE_ENV,
  });
}
