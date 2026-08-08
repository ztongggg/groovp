"use client";

// EXPERIMENT: consent/orientation screen, reached from the "Start Web
// Experiment A/B" links on /login (?c=A or ?c=B — never shown to the
// participant, just carried through to startExperimentSession). The timer
// doesn't start until "Begin" is clicked here — see lib/experiment.js for
// the removal checklist.

import { useSearchParams } from "next/navigation";
import { startExperimentSession } from "@/lib/experiment";

export default function ExperimentIntroPage() {
  const searchParams = useSearchParams();
  const arm = searchParams.get("c") === "B" ? "B" : "A";
  return (
    <div className="relative w-[402px] bg-white" style={{ minHeight: 874, padding: "72px 32px 40px" }}>
      <p style={{ fontSize: 24, fontWeight: 800, color: "#1D1B44" }}>Before you start</p>
      <p style={{ marginTop: 14, fontSize: 14, color: "#1D1B44", lineHeight: "21px" }}>
        You&apos;re about to try Groovp for the first time, as if you were a real student. There&apos;s no script — just do
        what feels natural.
      </p>
      <p style={{ marginTop: 16, fontSize: 14, color: "#1D1B44", lineHeight: "21px" }}>
        Along the way you&apos;ll be asked to do four things: create a profile, find a team and request to join, set up a
        project of your own, and review someone who wants to join it. Groovp will guide you at each step.
      </p>
      <p style={{ marginTop: 16, fontSize: 13, color: "#757080", lineHeight: "20px" }}>
        We&apos;ll quietly time how long each step takes — there&apos;s no pass or fail, and no clock on screen, so don&apos;t
        rush. Use any email address to sign up.
      </p>
      <button
        type="button"
        onClick={() => startExperimentSession(arm)}
        style={{ marginTop: 32, width: "100%", height: 54, borderRadius: 20, background: "#7C3AED", color: "#fff", fontSize: 15, fontWeight: 700 }}
      >
        Begin
      </button>
    </div>
  );
}
