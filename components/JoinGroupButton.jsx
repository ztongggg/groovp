"use client";

import { useState } from "react";
import { requestToJoin } from "@/app/discover/actions";

export default function JoinGroupButton({ groupId, full }) {
  const [status, setStatus] = useState("idle"); // idle | modal | loading | done | error
  const [note, setNote] = useState("");

  async function send() {
    setStatus("loading");
    const res = await requestToJoin(groupId, note);
    setStatus(res?.error ? "error" : res?.joined ? "joined" : res?.reapplied ? "reapplied" : "done");
  }

  const done = status === "done" || status === "reapplied" || status === "joined";
  const label =
    status === "loading" ? "…"
      : status === "joined" ? "Joined ✓"
      : status === "reapplied" ? "Re-requested ✓"
      : status === "done" ? "Requested ✓"
      : status === "error" ? "Try again"
      : "Request to join";

  return (
    <>
      <button
        onClick={() => (status === "error" ? send() : setStatus("modal"))}
        disabled={status === "loading" || done || full}
        className="rounded-xl px-4 py-2 text-[13px] font-bold disabled:opacity-60"
        style={{ background: done ? "#dcf674" : "#7c3aed", color: done ? "#5f7900" : "#fff" }}
      >
        {full ? "Full" : label}
      </button>

      {status === "modal" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setStatus("idle")}>
          <div className="mx-auto w-[402px] rounded-t-3xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <p className="mb-1 text-[16px] font-bold text-navy">Request to join</p>
            <p className="mb-3 text-[13px] text-muted">Add a short note — it helps the leader decide (optional).</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. I've worked with React before and I'm free most evenings" className="w-full rounded-xl border border-line px-3 py-2.5 text-[14px] text-navy focus:outline-none" />
            <button onClick={send} className="mt-3 w-full rounded-xl py-3 text-[14px] font-bold text-white" style={{ background: "#7c3aed" }}>Send request</button>
            <button onClick={() => setStatus("idle")} className="mt-2 w-full py-2 text-[14px] font-semibold text-muted">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
