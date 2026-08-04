"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinByCode } from "@/app/join/actions";

export default function JoinCodeForm({ initialCode = "" }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [state, setState] = useState({ kind: "idle", msg: "" });

  async function submit() {
    if (!code.trim()) return;
    setState({ kind: "loading", msg: "" });
    const res = await joinByCode(code);
    if (res?.error) {
      setState({ kind: "error", msg: res.error });
      return;
    }
    setState({ kind: "ok", msg: res.already ? `Already in ${res.name} — opening…` : `Joined ${res.name}!` });
    router.push(`/project/${res.projectId}`);
  }

  return (
    <div className="mt-8 px-6">
      <label className="text-[13px] font-bold text-navy">Project code</label>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="GRV-XXXXX"
        autoCapitalize="characters"
        className="mt-2 w-full rounded-xl border border-line px-4 text-[16px] font-semibold uppercase tracking-wider text-navy outline-none"
        style={{ height: 52, letterSpacing: "0.08em" }}
      />
      {state.msg && (
        <p className="mt-2 text-[13px] font-semibold" style={{ color: state.kind === "error" ? "#bf4247" : "#298c52" }}>
          {state.msg}
        </p>
      )}
      <button
        onClick={submit}
        disabled={state.kind === "loading" || !code.trim()}
        className="mt-5 w-full rounded-2xl py-3.5 text-[15px] font-bold text-white disabled:opacity-50"
        style={{ background: "#7c3aed" }}
      >
        {state.kind === "loading" ? "Joining…" : "Join project"}
      </button>
      <p className="mt-4 text-center text-[12px] text-muted">
        Ask your project owner for the code, or scan the link they shared.
      </p>
    </div>
  );
}
