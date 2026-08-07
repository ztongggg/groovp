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
    <div style={{ textAlign: "right" }}>
      <button
        onClick={onClick}
        disabled={busy}
        style={{ height: 36, minWidth: 110, padding: "0 14px", borderRadius: 18, background: "#7C3AED", color: "#fff", fontSize: 11.5, fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, opacity: busy ? 0.6 : 1 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 0 1-11.5 7.2L4 20l.8-4.5A8 8 0 1 1 20 12Z" /></svg>
        {busy ? "…" : "Message"}
      </button>
      {error && <p className="mt-1.5 text-[12px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
    </div>
  );
}
