"use client";

// EXPERIMENT: on-screen task timer for the web experiment. Renders nothing
// unless the participant has an active experiment session (cookie-gated
// server-side inside getExperimentStatus — real users never see this).
// See lib/experiment.js for the removal checklist.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getExperimentStatus } from "@/lib/experiment";

const LABELS = {
  1: "Task 1 · Create your profile",
  2: "Task 2 · Find a team & request to join",
  3: "Task 3 · Create your project & group",
  4: "Task 4 · Review an applicant",
};

function fmt(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ExperimentTimerOverlay() {
  const [status, setStatus] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const s = await getExperimentStatus().catch(() => ({ active: false }));
      if (!cancelled) setStatus(s);
    }
    poll();
    const iv = setInterval(poll, 2500);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  if (!status?.active) return null;

  if (status.completed) {
    return (
      <div style={WRAP}>
        <span style={{ fontWeight: 700 }}>🎉 Experiment complete</span>
        <Link href="/experiment/results" style={{ color: "#fff", textDecoration: "underline", fontWeight: 700 }}>
          View results →
        </Link>
      </div>
    );
  }

  if (!status.taskNumber) return null; // between tasks (e.g. during the tutorial) — nothing timed right now

  const elapsed = Math.max(0, Math.round((now - new Date(status.startedAt).getTime()) / 1000));

  return (
    <div style={WRAP}>
      <span style={{ fontWeight: 700 }}>{LABELS[status.taskNumber]}</span>
      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 800 }}>{fmt(elapsed)}</span>
    </div>
  );
}

const WRAP = {
  position: "fixed",
  top: 10,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 14px",
  borderRadius: 999,
  background: "#1D1B44",
  color: "#fff",
  fontSize: 11.5,
  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
  maxWidth: 370,
  whiteSpace: "nowrap",
};
