"use client";

import { useFormState, useFormStatus } from "react-dom";
import { changePassword } from "@/app/settings/actions";

function Btn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-50">
      {pending ? "Updating…" : "Update password"}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [state, formAction] = useFormState(changePassword, {});
  return (
    <form action={formAction} className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[13px] font-bold uppercase tracking-wide text-muted">Change password</p>
      <input name="password" type="password" required minLength={6} placeholder="New password (min 6 chars)" className="mt-3 w-full rounded-xl border border-line bg-bgapp px-3 py-2.5 text-[14px] text-navy focus:outline-none" />
      {state?.error && <p className="mt-2 text-[13px] text-badge-declinedText">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-[13px] font-semibold text-[#298c52]">Password updated ✓</p>}
      <div><Btn /></div>
    </form>
  );
}
