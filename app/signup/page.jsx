"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signUp } from "@/app/auth/actions";

function SubmitButton({ children }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[16px] font-bold text-white disabled:opacity-60"
    >
      {pending ? "…" : children}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signUp, {});

  return (
    <div className="flex min-h-full flex-col bg-white px-6 pt-20 pb-10">
      <h1 className="text-[34px] font-extrabold text-purple-600">Groovp</h1>
      <p className="mt-2 text-[16px] text-muted">Create your account.</p>

      <form action={formAction} className="mt-8 flex flex-col gap-3">
        <input name="full_name" required placeholder="Full name" className="rounded-2xl border border-line bg-bgapp px-4 py-4 text-[15px] text-navy focus:border-purple-600 focus:outline-none" />
        <input name="username" required placeholder="Username" className="rounded-2xl border border-line bg-bgapp px-4 py-4 text-[15px] text-navy focus:border-purple-600 focus:outline-none" />
        <input name="email" type="email" required placeholder="Email" className="rounded-2xl border border-line bg-bgapp px-4 py-4 text-[15px] text-navy focus:border-purple-600 focus:outline-none" />
        <input name="password" type="password" required minLength={6} placeholder="Password (min 6 chars)" className="rounded-2xl border border-line bg-bgapp px-4 py-4 text-[15px] text-navy focus:border-purple-600 focus:outline-none" />

        {state?.error && (
          <p className="text-[14px] font-medium text-badge-declinedText">{state.error}</p>
        )}

        <SubmitButton>Sign Up</SubmitButton>
      </form>

      <p className="mt-6 text-center text-[15px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-purple-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
