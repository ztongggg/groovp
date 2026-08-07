"use client";

import { useState } from "react";
import Link from "next/link";
import { acceptRequest, declineRequest } from "@/app/applicants/actions";
import { ApplicantFace, StrongMatchPill, CARD_STYLE, appliedLabel } from "@/components/ApplicantParts";

const NAME = { fontSize: 13, fontWeight: 700, color: "#1D1B44" };
const SUB = { fontSize: 10.5, color: "#757080" };
const META = { fontSize: 10, color: "#757080" };

/** A pending request, with Accept / Decline in place. */
export default function ApplicantCard({ id, groupId, applicantId, name, username, subtitle, createdAt, avatarUrl, comment, isStrongMatch, queueIds = [], index = 0 }) {
  const [state, setState] = useState("idle"); // idle | working | accepted | declined | error
  const [msg, setMsg] = useState("");

  async function onAccept() {
    setState("working");
    const r = await acceptRequest(id, groupId, applicantId);
    if (r?.error) { setMsg(r.error); setState("error"); }
    else setState("accepted");
  }
  async function onDecline() {
    setState("working");
    const r = await declineRequest(id);
    if (r?.error) { setMsg(r.error); setState("error"); }
    else setState("declined");
  }

  if (state === "accepted" || state === "declined") {
    return (
      <div style={{ ...CARD_STYLE, padding: 16, fontSize: 13, fontWeight: 600, color: state === "accepted" ? "#298c52" : "#bf4247" }}>
        {name} {state === "accepted" ? "accepted ✓" : "declined"}
      </div>
    );
  }

  const href = `/u/${applicantId}?groupId=${groupId}${queueIds.length > 1 ? `&queue=${queueIds.join(",")}` : ""}`;

  return (
    <div style={{ ...CARD_STYLE, padding: comment ? 10 : 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link href={href} style={{ flexShrink: 0 }}><ApplicantFace url={avatarUrl} index={index} /></Link>
        <Link href={href} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <span style={{ ...NAME, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
            {isStrongMatch && <StrongMatchPill />}
          </span>
          <span style={{ ...SUB, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle || `@${username}`}</span>
          {createdAt && <span style={META}>{appliedLabel(createdAt)}</span>}
        </Link>
        <button onClick={onDecline} disabled={state === "working"} aria-label={`Decline ${name}`} style={{ width: 32, height: 32, borderRadius: 16, background: "#FAEBEB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF4625" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
        <button onClick={onAccept} disabled={state === "working"} style={{ width: 66, height: 32, borderRadius: 16, background: "#D4F2DE", fontSize: 11.5, fontWeight: 600, color: "#298C52", flexShrink: 0 }}>
          {state === "working" ? "…" : "Accept"}
        </button>
      </div>

      {comment && <p style={{ marginTop: 10, fontSize: 12, color: "#1E1E1E", lineHeight: "17px" }}>{comment}</p>}
      {state === "error" && <p style={{ marginTop: 8, fontSize: 12, color: "#bf4247" }}>{msg || "Something went wrong — please try again."}</p>}
    </div>
  );
}
