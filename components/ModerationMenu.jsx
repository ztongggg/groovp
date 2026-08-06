"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reportUser, blockUser, unblockUser } from "@/app/moderation/actions";

const REASONS = ["Fake profile / misrepresentation", "Inappropriate behavior", "Spam or scam", "Harassment", "Other"];

export default function ModerationMenu({ userId, name, blocked }) {
  const router = useRouter();
  const [view, setView] = useState(null); // null | menu | report | done | confirmBlock
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
              <div className="flex flex-col gap-2.5">
                <button onClick={() => setView("report")} className="rounded-2xl py-4 text-left px-4 text-[15px] font-bold" style={{ background: "#fae0e0", color: "#bf4247" }}>Report</button>
                <button onClick={() => (blocked ? doBlock() : setView("confirmBlock"))} disabled={busy} className="rounded-2xl py-4 text-left px-4 text-[15px] font-bold" style={{ background: "#fae0e0", color: "#bf4247" }}>{blocked ? "Unblock" : "Block"}</button>
                <button onClick={() => setView(null)} className="rounded-2xl py-4 text-left px-4 text-[15px] font-bold text-navy" style={{ background: "#f3f1f8" }}>Cancel</button>
              </div>
            )}

            {view === "confirmBlock" && (
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "#d44d52" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </span>
                <p className="text-[17px] font-extrabold text-navy">Block {name}?</p>
                <p className="mb-2 text-[13px] text-muted">They won&apos;t be able to message you, see your profile, or apply to your groups. You can unblock them anytime in Settings.</p>
                <button onClick={doBlock} disabled={busy} className="w-full rounded-xl py-3.5 text-[15px] font-bold" style={{ background: "#fae0e0", color: "#bf4247" }}>{busy ? "Blocking…" : "Block User"}</button>
                <button onClick={() => setView("menu")} className="w-full rounded-xl py-3 text-[14px] font-semibold text-navy" style={{ background: "#f3f1f8" }}>Cancel</button>
              </div>
            )}

            {view === "report" && (
              <div className="flex flex-col gap-2">
                <p className="text-[16px] font-bold text-navy">Report {name}</p>
                <p className="mb-1 text-[12.5px] text-muted">Tell us what&apos;s wrong. Reports are reviewed by the Groovp team.</p>
                {REASONS.map((r) => (
                  <button key={r} onClick={() => setReason(r)} className="flex items-center justify-between rounded-xl p-3.5 text-left text-[14px] font-semibold text-navy" style={{ background: "#f3f1f8" }}>
                    {r}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: reason === r ? "#bf4247" : "#c9c5d3" }}>{reason === r && <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#bf4247" }} />}</span>
                  </button>
                ))}
                <p className="mt-1 text-[13px] font-semibold text-navy">Additional details (optional)</p>
                <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={2} placeholder="Add any extra context that might help us review this." className="w-full rounded-xl px-3 py-2.5 text-[14px] text-navy focus:outline-none" style={{ background: "#f3f1f8" }} />
                <button onClick={submitReport} disabled={!reason || busy} className="mt-1 rounded-xl py-3.5 text-[15px] font-bold disabled:opacity-50" style={{ background: "#fae0e0", color: "#bf4247" }}>{busy ? "Sending…" : "Submit Report"}</button>
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
