"use client";

import { useState, useTransition } from "react";
import { setReportStatus } from "@/app/moderation/actions";

export default function ReportActions({ reportId, status }) {
  const [cur, setCur] = useState(status);
  const [pending, start] = useTransition();

  function run(next) {
    start(async () => {
      const res = await setReportStatus(reportId, next);
      if (!res?.error) setCur(next);
    });
  }

  const Btn = ({ next, label, bg, fg }) => (
    <button
      onClick={() => run(next)}
      disabled={pending || cur === next}
      className="rounded-lg px-3 py-1.5 text-[12px] font-bold disabled:opacity-40"
      style={{ background: bg, color: fg }}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-3 flex items-center gap-2">
      {cur === "open" ? (
        <>
          <Btn next="resolved" label="Resolve" bg="#d4f2de" fg="#298c52" />
          <Btn next="dismissed" label="Dismiss" bg="#f1f1f4" fg="#5b5b6b" />
        </>
      ) : (
        <>
          <span className="text-[12px] font-semibold" style={{ color: cur === "resolved" ? "#298c52" : "#5b5b6b" }}>
            {cur === "resolved" ? "Resolved ✓" : "Dismissed"}
          </span>
          <Btn next="open" label="Reopen" bg="#ece8fc" fg="#7c3aed" />
        </>
      )}
    </div>
  );
}
