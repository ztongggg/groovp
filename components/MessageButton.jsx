"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { openPrivateChat } from "@/app/chat/actions";

export default function MessageButton({ userId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    const res = await openPrivateChat(userId);
    if (res?.conversationId) router.push(`/dm/${res.conversationId}`);
    else setBusy(false);
  }

  return (
    <button onClick={onClick} disabled={busy} className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-2.5 text-[14px] font-bold text-white disabled:opacity-60">
      {busy ? "…" : "Message"}
    </button>
  );
}
