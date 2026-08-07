"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { acceptRequest, declineRequest } from "@/app/applicants/actions";
import DeclineReasonSheet from "@/components/DeclineReasonSheet";

// Bottom Accept/Decline bar for reviewing an applicant from their full profile
// (/u/[id]?groupId=...), with prev/next paging through the same queue used by
// the Requests list. Mirrors ApplicantCard's actions - same server actions,
// just reachable from the full-profile view instead of only the list row.
export default function ApplicantReviewBar({ requestId, groupId, applicantId, prevHref, nextHref }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // null | "accepted" | "declined"
  const [error, setError] = useState("");
  const [showDecline, setShowDecline] = useState(false);

  async function onAccept() {
    setBusy(true); setError("");
    const r = await acceptRequest(requestId, groupId, applicantId);
    setBusy(false);
    if (r?.error) { setError(r.error); return; }
    setDone("accepted"); router.refresh();
  }
  async function onDecline(reason) {
    setBusy(true); setError("");
    const r = await declineRequest(requestId, reason);
    setBusy(false);
    setShowDecline(false);
    if (r?.error) { setError(r.error); return; }
    setDone("declined"); router.refresh();
  }

  return (
    <div className="fixed bottom-0 left-1/2 z-20 flex w-[402px] -translate-x-1/2 flex-col gap-1.5 border-t border-line bg-white px-6 py-3">
      {error && <p className="text-center text-[12.5px] font-semibold" style={{ color: "#bf4247" }}>{error}</p>}
      <div className="flex items-center justify-between gap-3">
        {prevHref ? (
          <Link href={prevHref} aria-label="Previous applicant" className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "#f3f1f8" }}>‹</Link>
        ) : <span className="w-10" />}

        {done ? (
          <p className="flex-1 text-center text-[14px] font-bold" style={{ color: done === "accepted" ? "#298c52" : "#bf4247" }}>{done === "accepted" ? "Accepted ✓" : "Declined"}</p>
        ) : (
          <div className="flex flex-1 items-center justify-center gap-2.5">
            <button onClick={() => setShowDecline(true)} disabled={busy} aria-label="Decline" className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "#fae0e0" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bf4247" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
            <button onClick={onAccept} disabled={busy} className="flex-1 rounded-full py-2.5 text-[14px] font-bold" style={{ background: "#d4f2de", color: "#298c52" }}>{busy ? "…" : "Accept"}</button>
          </div>
        )}

        {nextHref ? (
          <Link href={nextHref} aria-label="Next applicant" className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "#f3f1f8" }}>›</Link>
        ) : <span className="w-10" />}
      </div>

      <DeclineReasonSheet open={showDecline} busy={busy} onConfirm={onDecline} onCancel={() => setShowDecline(false)} />
    </div>
  );
}
