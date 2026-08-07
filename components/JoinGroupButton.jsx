"use client";

import { useState } from "react";
import Link from "next/link";
import { requestToJoin } from "@/app/discover/actions";

export default function JoinGroupButton({ groupId, full }) {
  const [status, setStatus] = useState("idle"); // idle | modal | loading | confirmed | done | reapplied | joined | error
  const [note, setNote] = useState("");
  const [wasReapply, setWasReapply] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function send() {
    setStatus("loading");
    const res = await requestToJoin(groupId, note);
    if (res?.error) { setErrorMsg(res.error); setStatus("modal"); return; }
    if (res?.joined) { setStatus("joined"); return; }
    setWasReapply(!!res?.reapplied);
    setStatus("confirmed");
  }

  const settled = status === "done" || status === "reapplied" || status === "joined";
  const label =
    status === "loading" ? "…"
      : status === "joined" ? "Joined ✓"
      : status === "reapplied" ? "Re-requested ✓"
      : status === "done" ? "Requested ✓"
      : "Request to join";

  return (
    <>
      <button
        onClick={() => { setErrorMsg(""); setStatus("modal"); }}
        disabled={status === "loading" || settled || full}
        className="rounded-xl px-4 py-2 text-[13px] font-bold disabled:opacity-60"
        style={{ background: settled ? "#dcf674" : "#7c3aed", color: settled ? "#5f7900" : "#fff" }}
      >
        {full ? "Full" : label}
      </button>

      {status === "modal" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setStatus("idle")}>
          <div className="mx-auto w-[402px] rounded-t-3xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <p className="mb-1 text-[16px] font-bold text-navy">Request to join</p>
            <p className="mb-3 text-[13px] text-muted">Add a short note — it helps the leader decide (optional).</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="e.g. I've worked with React before and I'm free most evenings" className="w-full rounded-xl border border-line px-3 py-2.5 text-[14px] text-navy focus:outline-none" />
            {errorMsg && <p className="mt-2 text-[13px] font-semibold" style={{ color: "#bf4247" }}>{errorMsg}</p>}
            <button onClick={send} disabled={status === "loading"} className="mt-3 w-full rounded-xl py-3 text-[14px] font-bold text-white disabled:opacity-60" style={{ background: "#7c3aed" }}>{status === "loading" ? "Sending…" : "Send request"}</button>
            <button onClick={() => setStatus("idle")} className="mt-2 w-full py-2 text-[14px] font-semibold text-muted">Cancel</button>
          </div>
        </div>
      )}

      {status === "confirmed" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="mx-auto flex w-[402px] flex-col items-center rounded-t-3xl bg-white p-6 pb-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#d4f2de" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#298c52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <p className="mt-4 text-[18px] font-extrabold text-navy">Request sent!</p>
            <p className="mt-1 text-[13.5px] text-muted">The leader will review it — check Teams → Requested for updates.</p>
            <button onClick={() => setStatus(wasReapply ? "reapplied" : "done")} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-3.5 text-[15px] font-bold text-white">Keep Browsing</button>
            <Link href="/teams" className="mt-2 w-full rounded-2xl py-3.5 text-center text-[15px] font-bold text-navy" style={{ background: "#f3f1f8" }}>View Request Status</Link>
          </div>
        </div>
      )}
    </>
  );
}
