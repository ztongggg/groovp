"use client";

import { useState } from "react";
import Link from "next/link";
import { acceptRequest, declineRequest } from "@/app/applicants/actions";

export default function ApplicantCard({ id, groupId, applicantId, name, username, skills = [], project, group, comment, isStrongMatch, matchedSkills = [] }) {
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
      <Link href={`/u/${applicantId}?groupId=${groupId}`} className="flex items-center gap-3">
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
          <p className="truncate text-[12px] text-muted">@{username} · wants to join {project}</p>
        </div>
        <span className="text-[18px] text-muted">›</span>
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

      <div className="mt-4 flex gap-3">
        <button onClick={onDecline} disabled={state === "working"} className="flex-1 rounded-xl py-2.5 text-[14px] font-bold" style={{ background: "#fae0e0", color: "#bf4247" }}>Decline</button>
        <button onClick={onAccept} disabled={state === "working"} className="flex-1 rounded-xl py-2.5 text-[14px] font-bold text-white" style={{ background: "#7c3aed" }}>{state === "working" ? "…" : "Accept"}</button>
      </div>
      {state === "error" && <p className="mt-2 text-[12px] text-badge-declinedText">{msg || "Something went wrong — please try again."}</p>}
    </div>
  );
}
