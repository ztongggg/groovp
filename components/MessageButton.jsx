"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { openPrivateChat } from "@/app/chat/actions";

export default function MessageButton({ userId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    setBusy(true); setError("");
    const res = await openPrivateChat(userId);
    if (res?.conversationId) { router.push(`/dm/${res.conversationId}`); return; }
    setBusy(false);
    setError(res?.error || "Could not open chat.");
  }

  return (
    <div>
      <button onClick={onClick} disabled={busy} className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-60">
        {busy ? "…" : "Message"}
      </button>
      {error && <p className="mt-1.5 text-[12px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
    </div>
  );
}
