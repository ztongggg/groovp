"use client";

import { useState } from "react";
import { requestToJoin } from "@/app/discover/actions";
import RequestSentConfirmation from "@/components/RequestSentConfirmation";

// Join Request Modal (Figma node 868:3100) + Request Sent Confirmation (1192:869).

export default function RequestButton({ groupId, subtitle }) {
  const [status, setStatus] = useState("idle"); // idle | modal | loading | confirmed | done | reapplied | joined
  const [note, setNote] = useState("");
  const [wasReapply, setWasReapply] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function send() {
    setStatus("loading");
    const res = await requestToJoin(groupId, note);
    if (res?.error) { setErrorMsg(res.error); setStatus("modal"); return; }
    if (res?.joined) { setStatus("joined"); return; }
    setWasReapply(!!res?.reapplied);
    setStatus("confirmed"); // shows the Request Sent Confirmation sheet before settling
  }

  const settled = status === "done" || status === "reapplied" || status === "joined";
  const label =
    status === "loading" ? "…"
      : status === "joined" ? "Joined ✓"
      : status === "reapplied" ? "Re-requested ✓"
      : status === "done" ? "Requested ✓"
      : "Request";

  return (
    <>
      <button
        onClick={() => { setErrorMsg(""); setStatus("modal"); }}
        disabled={status === "loading" || settled}
        className="absolute flex items-center justify-center disabled:opacity-90"
        style={{ left: 15, top: 294, width: 306, height: 42, borderRadius: 14, background: settled ? "#7c3aedcc" : "#7c3aed" }}
      >
        <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{label}</span>
      </button>

      {status === "modal" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setStatus("idle")}>
          <div className="mx-auto w-[402px] rounded-t-3xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <p className="mb-1 text-[16px] font-bold text-navy">Request to join</p>
            {subtitle && <p className="mb-3 text-[13px] text-muted">{subtitle}</p>}
            <p className="mb-2 text-[13px] font-semibold text-navy">Add a note (optional)</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Tell them why you'd be a good fit — relevant experience, availability, etc." className="w-full rounded-xl bg-[#f3f1f8] px-3 py-2.5 text-[14px] text-navy focus:outline-none" />
            {errorMsg && <p className="mt-2 text-[13px] font-semibold" style={{ color: "#bf4247" }}>{errorMsg}</p>}
            <button onClick={send} disabled={status === "loading"} className="mt-3 w-full rounded-xl py-3.5 text-[14px] font-bold text-white disabled:opacity-60" style={{ background: "#7c3aed" }}>{status === "loading" ? "Sending…" : "Send Request"}</button>
            <button onClick={() => setStatus("idle")} className="mt-2 w-full rounded-xl py-3 text-[14px] font-semibold text-navy" style={{ background: "#f3f1f8" }}>Cancel</button>
          </div>
        </div>
      )}

      {status === "confirmed" && (
        <RequestSentConfirmation subtitle={subtitle} onKeepBrowsing={() => setStatus(wasReapply ? "reapplied" : "done")} />
      )}
    </>
  );
}
