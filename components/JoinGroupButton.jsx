"use client";

import { useState } from "react";
import { requestToJoin } from "@/app/discover/actions";
import RequestSentConfirmation from "@/components/RequestSentConfirmation";

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
        style={{ background: "#7c3aed", color: "#fff" }}
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
        <RequestSentConfirmation onKeepBrowsing={() => setStatus(wasReapply ? "reapplied" : "done")} />
      )}
    </>
  );
}
