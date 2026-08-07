"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unblockUser } from "@/app/moderation/actions";

const AVATARS = ["#A78BFA", "#F472B6", "#4AC7B2", "#FBBF24", "#9496F4"];

export default function BlockedUserRow({ userId, name, avatarUrl = "", index = 0 }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onUnblock() {
    setBusy(true);
    await unblockUser(userId);
    setBusy(false);
    router.refresh();
  }

  return (
    <div style={{ height: 64, background: "#fff", borderRadius: 16, border: "1px solid #F3F1F8", display: "flex", alignItems: "center", gap: 12, padding: "0 12px" }}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: 9999, objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <span style={{ position: "relative", width: 40, height: 40, borderRadius: 9999, background: AVATARS[index % AVATARS.length], flexShrink: 0, display: "block" }}>
          <span style={{ position: "absolute", left: 8, top: 15, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
          <span style={{ position: "absolute", left: 26, top: 15, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
          <span style={{ position: "absolute", left: 14, top: 24, width: 12, height: 3, borderRadius: 9999, background: "#fff" }} />
        </span>
      )}
      <p style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: "#1D1B44", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
      <button
        onClick={onUnblock}
        disabled={busy}
        style={{ width: 88, height: 36, borderRadius: 18, background: "#F3F1F8", fontSize: 11.5, fontWeight: 600, color: "#1D1B44", flexShrink: 0, opacity: busy ? 0.5 : 1 }}
      >
        {busy ? "…" : "Unblock"}
      </button>
    </div>
  );
}
