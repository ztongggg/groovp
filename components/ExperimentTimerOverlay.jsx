"use client";

// EXPERIMENT: on-screen task guidance for the web experiment. No visible
// clock (time is still recorded in the DB — just not shown, so it doesn't
// pressure the participant). Renders nothing unless the participant has an
// active session (cookie-gated server-side inside getExperimentStatus —
// real users never see this). See lib/experiment.js for the removal
// checklist.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getExperimentStatus } from "@/lib/experiment";

const TASK_INSTRUCTIONS = {
  1: "Create your Groovp profile. Fill in your details, skills and interests to finish signing up.",
  2: "Browse Discover, find a project you like, pick a team that fits you, and request to join.",
  3: "Create your own project, then set up your group.",
  4: "Open your Requests and review the applicants waiting — accept one to finish.",
};

// Shown briefly between tasks (e.g. mid-tutorial, or right after a request
// is sent) — points at what to do to reach the next task.
const NEXT_STEP_INSTRUCTIONS = {
  1: "Profile created! Next: go through the quick tour, then head to Discover to find a team.",
  2: "Request sent! Next: create your own project and set up a group.",
  3: "Project created! Next: open your Requests and review who's applied.",
};

export default function ExperimentTimerOverlay() {
  const [status, setStatus] = useState(null);

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

  const text = status.taskNumber
    ? TASK_INSTRUCTIONS[status.taskNumber]
    : NEXT_STEP_INSTRUCTIONS[status.lastEndedTask];

  if (!text) return null;

  return (
    <div style={WRAP}>
      {status.taskNumber && <span style={{ fontWeight: 800, display: "block", marginBottom: 4 }}>Task {status.taskNumber}</span>}
      <span>{text}</span>
    </div>
  );
}

const WRAP = {
  position: "fixed",
  top: 40,
  left: 40,
  right: 40,
  zIndex: 9999,
  padding: "14px 16px",
  borderRadius: 16,
  background: "#1D1B44",
  color: "#fff",
  fontSize: 13,
  lineHeight: 1.4,
  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
};
