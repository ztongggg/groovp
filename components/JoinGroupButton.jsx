"use client";

import { useState } from "react";
import { requestToJoin } from "@/app/discover/actions";

export default function JoinGroupButton({ groupId, full }) {
  const [status, setStatus] = useState("idle");

  async function onClick() {
    setStatus("loading");
    const res = await requestToJoin(groupId);
    setStatus(res?.error ? "error" : res?.reapplied ? "reapplied" : "done");
  }

  const done = status === "done" || status === "reapplied";
  const label =
    status === "loading" ? "…"
      : status === "reapplied" ? "Re-requested ✓"
      : status === "done" ? "Requested ✓"
      : status === "error" ? "Try again"
      : "Request to join";

  return (
    <button
      onClick={onClick}
      disabled={status === "loading" || done || full}
      className="rounded-xl px-4 py-2 text-[13px] font-bold disabled:opacity-60"
      style={{ background: done ? "#dcf674" : "#7c3aed", color: done ? "#5f7900" : "#fff" }}
    >
      {full ? "Full" : label}
    </button>
  );
}
