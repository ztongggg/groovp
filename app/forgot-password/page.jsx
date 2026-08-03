"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { requestReset } from "@/app/forgot-password/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[16px] font-bold text-white disabled:opacity-60">
      {pending ? "Sending…" : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestReset, {});

  if (state?.ok) {
    return (
      <div className="flex min-h-full flex-col bg-white px-6 pt-28 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
        </div>
        <h1 className="text-[26px] font-extrabold text-navy">Check your email</h1>
        <p className="mt-2 text-[15px] text-muted">We've sent you a link to reset your password.</p>
        <Link href="/login" className="mt-8 w-full rounded-2xl bg-[#f3f1f8] py-4 text-[16px] font-bold text-navy">Back to log in</Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-white px-6 pt-24">
      <Link href="/login" className="text-[15px] font-semibold text-muted">‹ Back</Link>
      <h1 className="mt-3 text-[30px] font-extrabold text-navy">Forgot password?</h1>
      <p className="mt-2 text-[16px] text-muted">Enter your email and we'll send you a reset link.</p>

      <form action={formAction} className="mt-8 flex flex-col gap-3">
        <input name="email" type="email" required placeholder="Email" className="rounded-2xl border border-line bg-bgapp px-4 py-4 text-[15px] text-navy focus:border-purple-600 focus:outline-none" />
        {state?.error && <p className="text-[14px] font-medium text-badge-declinedText">{state.error}</p>}
        <Submit />
      </form>
    </div>
  );
}
