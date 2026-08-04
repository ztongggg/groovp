"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import StatusBar from "@/components/StatusBar";
import { signIn } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

async function signInWithLinkedIn() {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "linkedin_oidc",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=/home` },
  });
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="absolute flex items-center justify-center disabled:opacity-70" style={{ left: 32, top: 513, width: 337, height: 56, borderRadius: 20, background: "#7c3aed" }}>
      <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{pending ? "…" : "Log in"}</span>
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, {});

  return (
    <form action={formAction} className="relative w-[402px] bg-white" style={{ height: 874 }}>
      <div className="absolute inset-x-0 top-0"><StatusBar /></div>

      {/* glow + mascot */}
      <div className="absolute" style={{ left: 71, top: 40, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.35), rgba(124,58,237,0))" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/login-mascot.png" alt="" className="pointer-events-none absolute" style={{ left: 128, top: 105, width: 145, height: 147 }} />

      <div className="absolute w-full text-center" style={{ top: 290, fontSize: 30, fontWeight: 900, color: "#1e1b4b" }}>Welcome back!</div>

      {/* email */}
      <div className="absolute flex items-center" style={{ left: 32, top: 346, width: 337, height: 49, borderRadius: 16, background: "#f3f1f8", paddingLeft: 44 }}>
        <svg className="absolute" style={{ left: 16, top: 15 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="m4 8 8 5 8-5" /></svg>
        <input name="email" type="text" required placeholder="Username or email" className="w-full bg-transparent focus:outline-none" style={{ fontSize: 15, fontWeight: 600, color: "#1e1b4b" }} />
      </div>

      {/* password */}
      <div className="absolute flex items-center" style={{ left: 32, top: 412, width: 337, height: 49, borderRadius: 16, background: "#f3f1f8", paddingLeft: 44, paddingRight: 44 }}>
        <svg className="absolute" style={{ left: 16, top: 15 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
        <input name="password" type="password" required placeholder="Password" className="w-full bg-transparent focus:outline-none" style={{ fontSize: 15, fontWeight: 600, color: "#1e1b4b" }} />
      </div>

      <Link href="/forgot-password" className="absolute" style={{ right: 33, top: 474, fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>Forgot password?</Link>

      {state?.error && (
        <p className="absolute w-full text-center" style={{ top: 484, fontSize: 13, fontWeight: 600, color: "#bf4247" }}>{state.error}</p>
      )}

      <LoginButton />

      {/* Sign in with LinkedIn (real OAuth) */}
      <button type="button" onClick={signInWithLinkedIn} className="absolute flex items-center justify-center gap-2" style={{ left: 32, top: 588, width: 337, height: 49, borderRadius: 20, background: "#0a66c2" }}>
        <span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: "#fff" }}><span style={{ fontSize: 11, fontWeight: 900, color: "#0a66c2" }}>in</span></span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Continue with LinkedIn</span>
      </button>

      {/* sign up */}
      <div className="absolute flex w-full items-center justify-center gap-1.5" style={{ top: 651 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#6d7280" }}>Don&apos;t have an account?</span>
        <Link href="/signup" style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed" }}>Sign up</Link>
      </div>
    </form>
  );
}
