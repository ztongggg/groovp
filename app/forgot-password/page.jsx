"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { requestReset } from "@/app/forgot-password/actions";

// Figma nodes 664:4088 "Forgot Password" + 664:4136 "Forgot Password – Confirmation", file wA2wiOAqWkKr9JI319d5wT

function Marky() {
  return (
    <div className="absolute" style={{ left: 60, top: 173, width: 300, height: 300 }}>
      <div className="absolute" style={{ background: "#2ed573", left: 43.13, top: 157.5, width: 178.125, height: 73.125, borderTopLeftRadius: 84.375 }} />
      <div className="absolute" style={{ background: "#2ed573", left: 125.63, top: 48.75, width: 112.5, height: 181.875, borderTopRightRadius: 84.375 }} />
      <div className="absolute rounded-full" style={{ background: "#0b2a5b", left: 144.37, top: 105, width: 16.875, height: 16.875 }} />
      <div className="absolute rounded-full" style={{ background: "#0b2a5b", left: 202.5, top: 105, width: 16.875, height: 16.875 }} />
      <div className="absolute rounded-full" style={{ background: "#115e59", left: 166.87, top: 131.25, width: 31.875, height: 7.5 }} />
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="absolute flex items-center justify-center disabled:opacity-70" style={{ left: 32, top: 222, width: 338, height: 56, borderRadius: 28, background: "linear-gradient(90deg,#7c3aed,#6126cc)", boxShadow: "0px 8px 24px -4px rgba(26,20,51,0.12)" }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{pending ? "Sending…" : "Send Reset Link"}</span>
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestReset, {});
  const [email, setEmail] = useState("");

  if (state?.ok) {
    return (
      <div className="relative w-[402px]" style={{ height: 874, background: "#f9f8fb" }}>
        <Marky />
        <p className="absolute w-full text-center" style={{ top: 440, fontSize: 24, fontWeight: 800, color: "#1d1b44" }}>Check your email</p>
        <p className="absolute w-full text-center" style={{ top: 476, fontSize: 13.5, color: "#757080", padding: "0 32px" }}>We&apos;ve sent a password reset link to {email || "your email"}. It expires in 15 minutes.</p>
        <form action={formAction} className="absolute w-full text-center" style={{ top: 521 }}>
          <input type="hidden" name="email" value={email} />
          <span style={{ fontSize: 12.5, color: "#757080" }}>Didn&apos;t get it?{" "}</span>
          <button type="submit" className="underline" style={{ fontSize: 12.5, color: "#662ad3" }}>Resend link</button>
        </form>
        <Link href="/login" className="absolute flex items-center justify-center" style={{ left: 32, top: 800, width: 338, height: 56, borderRadius: 28, background: "linear-gradient(90deg,#7c3aed,#6126cc)", boxShadow: "0px 8px 24px -4px rgba(26,20,51,0.12)" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Back to Log In</span>
        </Link>
      </div>
    );
  }

  return (
    <form action={(fd) => { setEmail(fd.get("email")); formAction(fd); }} className="relative w-[402px] bg-white" style={{ height: 874 }}>
      <Link href="/login" className="absolute flex items-center justify-center rounded-full" style={{ left: 24, top: 48, width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span>
      </Link>
      <p className="absolute" style={{ left: 75, top: 54, fontSize: 24, fontWeight: 800, color: "#1d1b44", width: 300 }}>Forgot password?</p>
      <p className="absolute" style={{ left: 25, top: 95, fontSize: 13, color: "#757080", width: 340 }}>Enter the email linked to your account and we&apos;ll send you a reset link.</p>

      <div className="absolute" style={{ left: 32, top: 154, width: 338, height: 52, borderRadius: 14, background: "#f3f1f8" }}>
        <input name="email" type="email" required placeholder="Email" className="h-full w-full bg-transparent focus:outline-none" style={{ padding: "0 16px", fontSize: 14, color: "#1d1b44" }} />
      </div>

      {state?.error && <p className="absolute" style={{ left: 32, top: 190, fontSize: 12.5, fontWeight: 600, color: "#d44d52" }}>{state.error}</p>}

      <Submit />

      <p className="absolute w-full text-center" style={{ top: 294, fontSize: 12.5, color: "#757080" }}>
        Remembered your password?{" "}
        <Link href="/login" style={{ color: "#7c3aed", fontWeight: 600 }}>Log in</Link>
      </p>
    </form>
  );
}
