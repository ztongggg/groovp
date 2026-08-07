"use client";

import { useState } from "react";
import Link from "next/link";
import { acceptRequest, declineRequest } from "@/app/applicants/actions";

export const APPLICANT_AVATARS = ["#A78BFA", "#FF8671", "#F2A5BD", "#4AC7B2", "#C380DD"];

export function appliedLabel(iso) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return "Applied just now";
  const h = Math.floor(mins / 60);
  if (h < 24) return `Applied ${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Applied ${d} day${d === 1 ? "" : "s"} ago`;
  const w = Math.floor(d / 7);
  return `Applied ${w} week${w === 1 ? "" : "s"} ago`;
}

export function ApplicantFace({ url, index = 0, size = 44 }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" style={{ width: size, height: size, borderRadius: 9999, objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <span style={{ position: "relative", width: size, height: size, borderRadius: 9999, background: APPLICANT_AVATARS[index % APPLICANT_AVATARS.length], flexShrink: 0, display: "block" }}>
      <span style={{ position: "absolute", left: size * 0.18, top: size * 0.39, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: size * 0.68, top: size * 0.39, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: size * 0.36, top: size * 0.59, width: 12, height: 3, borderRadius: 9999, background: "#fff" }} />
    </span>
  );
}

export const CARD_STYLE = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #F3F1F8",
  boxShadow: "0px 2px 10px rgba(25,20,51,0.05)",
  padding: 8,
};

const NAME = { fontSize: 13, fontWeight: 700, color: "#1D1B44" };
const SUB = { fontSize: 10.5, color: "#757080" };
const META = { fontSize: 10, color: "#757080" };

export function StrongMatchPill() {
  return <span style={{ flexShrink: 0, background: "#D4F2DE", borderRadius: 10, padding: "3px 8px", fontSize: 8.5, fontWeight: 600, color: "#298C52" }}>Strong Match</span>;
}

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
