"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reportUser } from "@/app/moderation/actions";

const REASONS = [
  "Fake profile or misrepresentation",
  "Inappropriate behavior",
  "Spam or scam",
  "Harassment",
  "Other",
];

export default function ReportUserForm({ userId, name }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!reason || busy) return;
    setBusy(true);
    await reportUser(userId, reason, details);
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ padding: "120px 24px 0", textAlign: "center" }}>
        <span style={{ width: 64, height: 64, borderRadius: 9999, background: "#D9F2E0", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#298c52" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7" /></svg>
        </span>
        <p style={{ marginTop: 20, fontSize: 19, fontWeight: 800, color: "#1D1B44" }}>Report submitted</p>
        <p style={{ marginTop: 8, fontSize: 12.5, color: "#757080" }}>Thanks — our team will review it.</p>
        <button onClick={() => router.push(`/u/${userId}`)} style={{ marginTop: 28, width: "100%", height: 52, borderRadius: 26, background: "#F3F1F8", color: "#1D1B44", fontSize: 14, fontWeight: 600 }}>Done</button>
      </div>
    );
  }

  return (
    <>
      <p style={{ padding: "0 25px", marginTop: 20, fontSize: 12.5, color: "#757080", lineHeight: "18px" }}>
        Tell us what&apos;s wrong. Reports are reviewed by the Groovp team.
      </p>

      <div style={{ padding: "0 24px", marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReason(r)}
            style={{ height: 52, borderRadius: 14, background: "#F3F1F8", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>{r}</span>
            <span style={{ width: 20, height: 20, borderRadius: 9999, background: reason === r ? "#D44D52" : "#fff", flexShrink: 0 }} />
          </button>
        ))}
      </div>

      <p style={{ padding: "0 24px", marginTop: 20, fontSize: 12, fontWeight: 600, color: "#1D1B44" }}>Additional details (optional)</p>
      <div style={{ padding: "0 24px", marginTop: 6 }}>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Add any extra context that might help us review this."
          style={{ width: "100%", height: 90, borderRadius: 14, background: "#F3F1F8", border: "1px solid #F3F1F8", padding: 16, fontSize: 12, color: "#1D1B44", resize: "none", outline: "none" }}
        />
      </div>

      <div style={{ padding: "0 24px", marginTop: 32, marginBottom: 24 }}>
        <button
          onClick={submit}
          disabled={!reason || busy}
          style={{ width: "100%", height: 56, borderRadius: 28, background: "#FAE0E0", color: "#BF4247", fontSize: 16, fontWeight: 600, boxShadow: "0px 4px 14px rgba(191,66,71,0.15)", opacity: reason && !busy ? 1 : 0.5 }}
        >
          {busy ? "Sending…" : "Submit Report"}
        </button>
      </div>
    </>
  );
}
