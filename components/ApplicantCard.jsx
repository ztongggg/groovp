"use client";

import { useState } from "react";
import Link from "next/link";
import { acceptRequest, declineRequest } from "@/app/applicants/actions";

function relTime(iso) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return "Applied just now";
  const h = Math.floor(mins / 60);
  if (h < 24) return `Applied ${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Applied ${d}d ago`;
  return `Applied ${Math.floor(d / 7)}w ago`;
}

export default function ApplicantCard({ id, groupId, applicantId, name, username, subtitle, createdAt, skills = [], project, group, comment, isStrongMatch, matchedSkills = [], queueIds = [] }) {
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
      <div className="rounded-2xl border border-line bg-white px-5 py-4 text-[14px] font-semibold" style={{ color: state === "accepted" ? "#298c52" : "#bf4247" }}>
        {name} {state === "accepted" ? "accepted ✓" : "declined"}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <Link href={`/u/${applicantId}?groupId=${groupId}${queueIds.length > 1 ? `&queue=${queueIds.join(",")}` : ""}`} className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: "#7c3aed" }}>
          {(name || "?").slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[15px] font-bold text-navy">{name}</p>
            {isStrongMatch && (
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white" style={{ background: "#7c3aed" }}>✨ Strong Match</span>
            )}
          </div>
          <p className="truncate text-[12px] text-muted">{subtitle || `@${username}`}</p>
          {createdAt && <p className="truncate text-[11px] text-muted">{relTime(createdAt)}</p>}
        </div>
      </Link>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.slice(0, 5).map((s) => {
            const matched = matchedSkills.some((m) => m.toLowerCase() === s.toLowerCase());
            return (
              <span
                key={s}
                className="rounded-full px-3 py-1 text-[11px] font-semibold"
                style={matched
                  ? { background: "#d4f2de", color: "#298c52", border: "1px solid #298c52" }
                  : { background: "#f5f0ff", color: "#7c3aed" }}
              >
                {s}
              </span>
            );
          })}
        </div>
      )}

      {comment && <p className="mt-3 text-[13px] text-muted">“{comment}”</p>}

      <div className="mt-4 flex items-center justify-end gap-2.5">
        <button onClick={onDecline} disabled={state === "working"} aria-label="Decline" className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#fae0e0" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bf4247" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
        <button onClick={onAccept} disabled={state === "working"} className="rounded-full px-6 py-2.5 text-[14px] font-bold" style={{ background: "#d4f2de", color: "#298c52" }}>{state === "working" ? "…" : "Accept"}</button>
      </div>
      {state === "error" && <p className="mt-2 text-[12px] text-badge-declinedText">{msg || "Something went wrong — please try again."}</p>}
    </div>
  );
}
