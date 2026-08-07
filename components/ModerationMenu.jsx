"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { blockUser, unblockUser } from "@/app/moderation/actions";

/**
 * The "⋯" control on another user's profile.
 *
 * Three Figma frames drive this: "Profile Options Menu" (bottom sheet),
 * "Block User" (centred confirmation modal) and "Report User" — the last of
 * which is a full screen, so Report navigates to /u/[id]/report rather than
 * swapping the sheet's contents.
 */
export default function ModerationMenu({ userId, name, blocked }) {
  const router = useRouter();
  const [view, setView] = useState(null); // null | menu | confirmBlock
  const [busy, setBusy] = useState(false);

  async function doBlock() {
    setBusy(true);
    await (blocked ? unblockUser(userId) : blockUser(userId));
    setBusy(false);
    setView(null);
    router.refresh();
  }

  const rowBase = { width: "100%", height: 52, borderRadius: 14, display: "flex", alignItems: "center", paddingLeft: 16, fontSize: 13.5, fontWeight: 600 };

  return (
    <>
      <button
        onClick={() => setView("menu")}
        aria-label="More options"
        style={{ width: 40, height: 40, borderRadius: 9999, background: "rgba(255,255,255,0.80)", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1D1B44"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
      </button>

      {view === "menu" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.35)" }} onClick={() => setView(null)}>
          <div className="mx-auto w-[402px]" style={{ background: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 8 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 40, height: 5, borderRadius: 3, background: "#F3F1F8", margin: "14px auto 0" }} />
            <div style={{ padding: "26px 24px 0", display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => router.push(`/u/${userId}/report`)} style={{ ...rowBase, background: "#FAE0E0", color: "#BF4247" }}>Report</button>
              <button onClick={() => (blocked ? doBlock() : setView("confirmBlock"))} disabled={busy} style={{ ...rowBase, background: "#FAE0E0", color: "#BF4247" }}>{blocked ? "Unblock" : "Block"}</button>
              <button onClick={() => setView(null)} style={{ ...rowBase, background: "#F3F1F8", color: "#1D1B44" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {view === "confirmBlock" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.40)" }} onClick={() => setView(null)}>
          <div style={{ width: 354, background: "#fff", borderRadius: 24, boxShadow: "0px 8px 30px rgba(25,20,51,0.18)", padding: "28px 24px 24px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <span style={{ width: 64, height: 64, borderRadius: 9999, background: "#D44D52", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </span>
            <p style={{ marginTop: 20, fontSize: 19, fontWeight: 800, color: "#1D1B44" }}>Block {name}?</p>
            <p style={{ marginTop: 12, fontSize: 12, color: "#757080", lineHeight: "18px" }}>
              They won&apos;t be able to message you, see your profile, or apply to your groups. You can unblock them anytime in Settings.
            </p>
            <button onClick={doBlock} disabled={busy} style={{ marginTop: 24, width: "100%", height: 52, borderRadius: 26, background: "#FAE0E0", color: "#BF4247", fontSize: 13.5, fontWeight: 600 }}>{busy ? "Blocking…" : "Block User"}</button>
            <button onClick={() => setView(null)} style={{ marginTop: 6, width: "100%", height: 48, borderRadius: 24, background: "#F3F1F8", color: "#1D1B44", fontSize: 13, fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
