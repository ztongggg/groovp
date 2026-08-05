"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unblockUser } from "@/app/moderation/actions";

export default function BlockedUserRow({ userId, name }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onUnblock() {
    setBusy(true);
    await unblockUser(userId);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: "#7c3aed" }}>
          {(name || "?").slice(0, 2).toUpperCase()}
        </span>
        <p className="text-[13.5px] font-semibold text-navy">{name}</p>
      </div>
      <button onClick={onUnblock} disabled={busy} className="rounded-full px-4 py-2 text-[11.5px] font-semibold text-navy disabled:opacity-50" style={{ background: "#f3f1f8" }}>
        {busy ? "…" : "Unblock"}
      </button>
    </div>
  );
}
