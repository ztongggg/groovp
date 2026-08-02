"use client";

import { useState } from "react";
import { requestToJoin } from "@/app/discover/actions";

export default function RequestButton({ groupId }) {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  async function onClick() {
    setStatus("loading");
    const res = await requestToJoin(groupId);
    setStatus(res?.error ? "error" : "done");
  }

  const label =
    status === "loading" ? "…" : status === "done" ? "Requested ✓" : status === "error" ? "Try again" : "Request";

  return (
    <button
      onClick={onClick}
      disabled={status === "loading" || status === "done"}
      className="absolute flex items-center justify-center disabled:opacity-90"
      style={{ left: 15, top: 294, width: 306, height: 42, borderRadius: 14, background: status === "done" ? "#dcf674cc" : "#dcf674" }}
    >
      <span style={{ fontSize: 13, fontWeight: 800, color: "#5f7900" }}>{label}</span>
    </button>
  );
}
