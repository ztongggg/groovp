"use client";

import { useState } from "react";

// Shared bottom sheet for the optional decline reason — an applicant
// previously got a bare "declined" with zero feedback and a 3-day blind
// wait before they could reapply. Reason stays optional (leaders are busy,
// forcing one would just get low-effort filler text).
export default function DeclineReasonSheet({ open, busy, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onCancel}>
      <div className="mx-auto w-[402px] rounded-t-3xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <p className="mb-1 text-[16px] font-bold text-navy">Decline request</p>
        <p className="mb-3 text-[12.5px] text-muted">Let them know why (optional) — this shows up in their notification.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Looking for someone with more backend experience"
          className="w-full rounded-2xl bg-[#f3f1f8] px-4 py-3 text-[13px] text-navy focus:outline-none"
        />
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={onCancel} disabled={busy} className="flex-1 rounded-2xl py-3.5 text-[14px] font-bold text-navy" style={{ background: "#f3f1f8" }}>Cancel</button>
          <button type="button" onClick={() => onConfirm(reason)} disabled={busy} className="flex-1 rounded-2xl py-3.5 text-[14px] font-bold text-white disabled:opacity-60" style={{ background: "#bf4247" }}>{busy ? "…" : "Decline"}</button>
        </div>
      </div>
    </div>
  );
}
