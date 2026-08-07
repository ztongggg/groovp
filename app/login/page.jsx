"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn } from "@/app/auth/actions";

// Figma node 1065:2102 "Welcome Page" (+ 891:3491 error variant), file wA2wiOAqWkKr9JI319d5wT

function Cloudy() {
  return (
    <div className="absolute overflow-hidden" style={{ left: 59, top: 28, width: 284, height: 284 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-a.svg" alt="" className="absolute" style={{ left: 157.73, top: 161.31, width: 70.053, height: 70.053 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-a.svg" alt="" className="absolute" style={{ left: 250.93, top: 161.31, width: 70.053, height: 70.053 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-b.svg" alt="" className="absolute" style={{ left: 250.93, top: 243.76, width: 70.053, height: 68.16 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-a.svg" alt="" className="absolute" style={{ left: 161.31, top: 250.93, width: 70.053, height: 70.053 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-c.svg" alt="" className="absolute" style={{ left: 139.8, top: 229.42, width: 41.653, height: 41.653 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-d.svg" alt="" className="absolute" style={{ left: 229.42, top: 139.8, width: 39.76, height: 41.653 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-c.svg" alt="" className="absolute" style={{ left: 322.62, top: 233.01, width: 41.653, height: 41.653 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-c.svg" alt="" className="absolute" style={{ left: 240.18, top: 322.62, width: 41.653, height: 41.653 }} />
      <div className="absolute rounded-full" style={{ background: "#0b2a5b", left: 215.08, top: 247.35, width: 16.312, height: 20.827 }} />
      <div className="absolute rounded-full" style={{ background: "#0b2a5b", left: 298.91, top: 247.35, width: 16.312, height: 20.827 }} />
      <div className="absolute rounded-full" style={{ background: "#1d4ed8", left: 261.68, top: 304.7, width: 9.467, height: 13.253 }} />
    </div>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a21.7 21.7 0 0 1-2.61 3.87M14.12 14.12a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></svg>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="absolute flex items-center justify-center disabled:opacity-70" style={{ left: 32, top: 506, width: 337, height: 56, borderRadius: 20, background: "#7c3aed" }}>
      <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{pending ? "…" : "Log in"}</span>
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, {});
  const [showPw, setShowPw] = useState(false);

  return (
    <form action={formAction} className="relative w-[402px] bg-white" style={{ height: 874 }}>
      

      <div className="absolute" style={{ left: 71, top: 40, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.35), rgba(124,58,237,0))" }} />
      <Cloudy />

      <p className="absolute" style={{ left: 87, top: 264, fontSize: 30, fontWeight: 800, color: "#1e1b4b" }}>Welcome back!</p>

      {/* username/email */}
      <div className="absolute flex items-center" style={{ left: 32, top: 346, width: 337, height: 49, borderRadius: 16, background: "#f3f1f8", paddingLeft: 44 }}>
        <svg className="absolute" style={{ left: 16, top: 15 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        <input name="email" type="text" required placeholder="Username or email" className="login-field w-full bg-transparent focus:outline-none" style={{ fontSize: 15, fontWeight: 600, color: "#1e1b4b" }} />
      </div>

      {/* password */}
      <div className="absolute flex items-center" style={{ left: 32, top: 412, width: 337, height: 49, borderRadius: 16, background: "#f3f1f8", paddingLeft: 44, paddingRight: 44 }}>
        <svg className="absolute" style={{ left: 16, top: 15 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
        <input name="password" type={showPw ? "text" : "password"} required placeholder="Password" className="login-field w-full bg-transparent focus:outline-none" style={{ fontSize: 15, fontWeight: 600, color: "#1e1b4b" }} />
        <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute flex items-center justify-center" style={{ right: 16, top: 16 }} aria-label={showPw ? "Hide password" : "Show password"}>
          <EyeIcon open={showPw} />
        </button>
      </div>

      {/* error (left) + forgot password (right), same row per Figma error-state variant */}
      <div className="absolute flex items-start justify-between" style={{ left: 23, top: 475.5, width: 354 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#d44d52", width: 230 }}>{state?.error || ""}</p>
        <Link href="/forgot-password" style={{ fontSize: 12.5, fontWeight: 600, color: "#7c3aed", textAlign: "right" }}>Forgot password?</Link>
      </div>

      <LoginButton />

      {/* sign up — two stacked lines per Figma, not inline */}
      <p className="absolute w-full text-center" style={{ top: 652, fontSize: 12.5, fontWeight: 400, color: "#757080" }}>Don&apos;t have an account?</p>
      <Link href="/signup" className="absolute w-full text-center" style={{ top: 674, fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>Sign up</Link>
    </form>
  );
}
