"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { acceptRequest, declineRequest } from "@/app/applicants/actions";

const AVATARS = ["#A78BFA", "#FF8671", "#4AC7B2", "#FBBF24", "#F2A5BD"];

/**
 * A pending join request rendered inline on Group Info, with Accept/Decline in
 * place. Same server actions as the full Requests screen — this is a second
 * entry point to them, not a second implementation.
 */
export default function GroupRequestRow({ request, groupId, index = 0 }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [done, setDone] = useState("");

  async function act(kind) {
    if (busy) return;
    setBusy(kind);
    const res = kind === "accept" ? await acceptRequest(request.id, groupId, request.userId) : await declineRequest(request.id);
    setBusy("");
    if (res?.error) return;
    setDone(kind === "accept" ? "Accepted" : "Declined");
    router.refresh();
  }

  if (done) {
    return (
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F3F1F8", boxShadow: "0px 2px 10px rgba(25,20,51,0.05)", padding: 16, fontSize: 12.5, fontWeight: 600, color: "#757080" }}>
        {done} — {request.name}
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F3F1F8", boxShadow: "0px 2px 10px rgba(25,20,51,0.05)", padding: 8, display: "flex", alignItems: "center", gap: 10 }}>
      <Link href={`/u/${request.userId}?groupId=${groupId}`} style={{ flexShrink: 0 }}>
        {request.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={request.avatarUrl} alt="" style={{ width: 44, height: 44, borderRadius: 9999, objectFit: "cover" }} />
        ) : (
          <span style={{ position: "relative", width: 44, height: 44, borderRadius: 9999, background: AVATARS[index % AVATARS.length], display: "block" }}>
            <span style={{ position: "absolute", left: 8, top: 17, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
            <span style={{ position: "absolute", left: 30, top: 17, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
            <span style={{ position: "absolute", left: 16, top: 26, width: 12, height: 3, borderRadius: 9999, background: "#fff" }} />
          </span>
        )}
      </Link>

      <Link href={`/u/${request.userId}?groupId=${groupId}`} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1D1B44", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{request.name}</span>
          {request.strongMatch && (
            <span style={{ flexShrink: 0, background: "#D4F2DE", borderRadius: 10, padding: "3px 8px", fontSize: 8.5, fontWeight: 600, color: "#298C52" }}>Strong Match</span>
          )}
        </span>
        <span style={{ fontSize: 10.5, color: "#757080", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{request.subtitle}</span>
      </Link>

      <button onClick={() => act("decline")} disabled={!!busy} aria-label={`Decline ${request.name}`} style={{ width: 32, height: 32, borderRadius: 16, background: "#FAEBEB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF4625" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
      <button onClick={() => act("accept")} disabled={!!busy} style={{ width: 66, height: 32, borderRadius: 16, background: "#D4F2DE", fontSize: 11.5, fontWeight: 600, color: "#298C52", flexShrink: 0 }}>
        {busy === "accept" ? "…" : "Accept"}
      </button>
    </div>
  );
}
