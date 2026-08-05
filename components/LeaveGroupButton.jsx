"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leaveGroup } from "@/app/groups/[groupId]/actions";

// Non-leader "Leave Group" — leaders go through Edit Group's transfer-or-end flow
// instead (this button only ever renders for non-leaders, see GroupInfoPage).
export default function LeaveGroupButton({ groupId }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onLeave() {
    setBusy(true); setError("");
    const r = await leaveGroup(groupId);
    setBusy(false);
    if (r?.error) { setError(r.error); return; }
    router.push("/teams");
  }

  if (!confirming) {
    return <button onClick={() => setConfirming(true)} className="w-full rounded-2xl py-3 text-[13px] font-semibold" style={{ background: "#fae0e0", color: "#bf4247" }}>Leave Group</button>;
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-[14px] font-semibold text-navy">Leave this group?</p>
      <p className="mt-1 text-[12.5px] text-muted">You&apos;ll need a new invite or join request to get back in.</p>
      {error && <p className="mt-2 text-[12px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={() => setConfirming(false)} className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-navy" style={{ background: "#f3f1f8" }}>Cancel</button>
        <button onClick={onLeave} disabled={busy} className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-white disabled:opacity-50" style={{ background: "#bf4247" }}>{busy ? "Leaving…" : "Leave"}</button>
      </div>
    </div>
  );
}
