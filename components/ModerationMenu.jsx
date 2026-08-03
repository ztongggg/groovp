"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reportUser, blockUser, unblockUser } from "@/app/moderation/actions";

const REASONS = ["Fake profile / misrepresentation", "Inappropriate behavior", "Spam or scam", "Harassment", "Other"];

export default function ModerationMenu({ userId, name, blocked }) {
  const router = useRouter();
  const [view, setView] = useState(null); // null | menu | report | done
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  async function doBlock() {
    setBusy(true);
    await (blocked ? unblockUser(userId) : blockUser(userId));
    setBusy(false);
    setView(null);
    router.refresh();
  }
  async function submitReport() {
    if (!reason) return;
    setBusy(true);
    await reportUser(userId, reason, details);
    setBusy(false);
    setView("done");
  }

  return (
    <>
      <button onClick={() => setView("menu")} aria-label="More" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-[20px] font-bold text-white">⋯</button>

      {view && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setView(null)}>
          <div className="mx-auto w-[402px] rounded-t-3xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            {view === "menu" && (
              <div className="flex flex-col gap-2">
                <p className="mb-2 text-center text-[13px] font-semibold text-muted">{name}</p>
                <button onClick={() => setView("report")} className="rounded-xl bg-[#f3f1f8] py-3.5 text-[15px] font-bold text-navy">Report user</button>
                <button onClick={doBlock} disabled={busy} className="rounded-xl py-3.5 text-[15px] font-bold" style={{ background: "#fae0e0", color: "#bf4247" }}>{blocked ? "Unblock user" : "Block user"}</button>
                <button onClick={() => setView(null)} className="mt-1 py-2 text-[15px] font-semibold text-muted">Cancel</button>
              </div>
            )}

            {view === "report" && (
              <div className="flex flex-col gap-2">
                <p className="mb-1 text-[16px] font-bold text-navy">Report {name}</p>
                {REASONS.map((r) => (
                  <button key={r} onClick={() => setReason(r)} className="flex items-center gap-3 rounded-xl p-3 text-left text-[14px] font-semibold text-navy" style={{ background: reason === r ? "#f5f0ff" : "#f3f1f8", border: `1px solid ${reason === r ? "#7c3aed" : "transparent"}` }}>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2" style={{ borderColor: reason === r ? "#7c3aed" : "#c9c5d3" }}>{reason === r && <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />}</span>
                    {r}
                  </button>
                ))}
                <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={2} placeholder="Add details (optional)" className="mt-1 w-full rounded-xl border border-line bg-bgapp px-3 py-2.5 text-[14px] text-navy focus:outline-none" />
                <button onClick={submitReport} disabled={!reason || busy} className="mt-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 py-3.5 text-[15px] font-bold text-white disabled:opacity-50">{busy ? "Sending…" : "Submit report"}</button>
                <button onClick={() => setView("menu")} className="py-1.5 text-[14px] font-semibold text-muted">Back</button>
              </div>
            )}

            {view === "done" && (
              <div className="py-4 text-center">
                <p className="text-[16px] font-bold text-navy">Report submitted</p>
                <p className="mt-1 text-[14px] text-muted">Thanks — our team will review it.</p>
                <button onClick={() => setView(null)} className="mt-4 w-full rounded-xl bg-[#f3f1f8] py-3 text-[15px] font-bold text-navy">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
