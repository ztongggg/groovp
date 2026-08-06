"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { changePassword } from "@/app/settings/actions";

function Btn({ blocked }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || blocked} className="mt-6 w-full rounded-full py-4 text-[16px] font-bold text-white disabled:opacity-50" style={{ background: "linear-gradient(90deg,#7c3aed,#6126cc)" }}>
      {pending ? "Updating…" : "Update Password"}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [state, formAction] = useFormState(changePassword, {});
  const [confirm, setConfirm] = useState("");
  const [password, setPassword] = useState("");
  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <form action={formAction}>
      <p className="text-[13px] font-semibold text-muted">New password</p>
      <input name="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-2xl px-4 py-3.5 text-[14px] text-navy focus:outline-none" style={{ background: "#f3f1f8" }} />

      <p className="mt-4 text-[13px] font-semibold text-muted">Confirm new password</p>
      <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-2 w-full rounded-2xl px-4 py-3.5 text-[14px] text-navy focus:outline-none" style={{ background: "#f3f1f8" }} />

      <p className="mt-2 text-[12.5px] font-semibold" style={{ color: mismatch ? "#bf4247" : "#7c3aed" }}>{mismatch ? "Passwords don't match" : "Use 8+ characters with a mix of letters & numbers"}</p>

      {state?.error && <p className="mt-2 text-[13px] font-semibold text-[#bf4247]">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-[13px] font-semibold text-[#298c52]">Password updated ✓</p>}
      <Btn blocked={mismatch} />
    </form>
  );
}
