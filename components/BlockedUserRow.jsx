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
    <div className="flex items-center justify-between rounded-2xl bg-white p-4" style={{ boxShadow: "0px 2px 8px rgba(26,20,51,0.06)" }}>
      <p className="text-[14px] font-bold text-navy">{name}</p>
      <button onClick={onUnblock} disabled={busy} className="rounded-full px-4 py-2 text-[12.5px] font-bold text-navy disabled:opacity-50" style={{ background: "#f3f1f8" }}>
        {busy ? "…" : "Unblock"}
      </button>
    </div>
  );
}
