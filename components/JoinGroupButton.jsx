"use client";

import { useState } from "react";
import { requestToJoin } from "@/app/discover/actions";

export default function JoinGroupButton({ groupId, full }) {
  const [status, setStatus] = useState("idle");

  async function onClick() {
    setStatus("loading");
    const res = await requestToJoin(groupId);
    setStatus(res?.error ? "error" : "done");
  }

  const label = status === "loading" ? "…" : status === "done" ? "Requested ✓" : status === "error" ? "Try again" : "Request to join";

  return (
    <button
      onClick={onClick}
      disabled={status === "loading" || status === "done" || full}
      className="rounded-xl px-4 py-2 text-[13px] font-bold disabled:opacity-60"
      style={{ background: status === "done" ? "#dcf674" : "#7c3aed", color: status === "done" ? "#5f7900" : "#fff" }}
    >
      {full ? "Full" : label}
    </button>
  );
}
