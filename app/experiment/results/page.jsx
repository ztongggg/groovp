import Link from "next/link";
import { getExperimentResults } from "@/lib/experiment";

// EXPERIMENT: results screen shown after Task 4 closes the session. New,
// standalone route — not a real-app screen — so it's a one-folder delete
// on removal. See lib/experiment.js for the rest of the checklist.

const TASK_LABEL = {
  1: "Create your profile",
  2: "Find a team & request to join",
  3: "Create your project & group",
  4: "Review an applicant",
};

function fmt(seconds) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default async function ExperimentResultsPage() {
  const results = await getExperimentResults();

  if (!results) {
    return (
      <div className="relative w-[402px] bg-white" style={{ minHeight: 874 }}>
        <div style={{ padding: "96px 32px", textAlign: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#1D1B44" }}>No experiment session found</p>
          <Link href="/login" style={{ display: "inline-block", marginTop: 12, fontSize: 13, fontWeight: 600, color: "#7C3AED" }}>Back to login</Link>
        </div>
      </div>
    );
  }

  const total = results.reduce((sum, r) => sum + (r.seconds || 0), 0);

  return (
    <div className="relative w-[402px] bg-white" style={{ minHeight: 874, padding: "56px 24px 40px" }}>
      <p style={{ fontSize: 24, fontWeight: 800, color: "#1D1B44", textAlign: "center" }}>🎉 You&apos;re all done!</p>
      <p style={{ marginTop: 8, fontSize: 13, color: "#757080", textAlign: "center" }}>Thanks for taking part in the Groovp web experiment. Here&apos;s how you got on.</p>

      <div style={{ marginTop: 32, borderRadius: 16, overflow: "hidden", border: "1px solid #EAE5FC" }}>
        {results.map((r, i) => (
          <div key={r.task} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: i % 2 ? "#F9F8FB" : "#fff" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Task {r.task} — {TASK_LABEL[r.task] || ""}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#7C3AED" }}>{fmt(r.seconds)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#ECE8FC" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#1D1B44" }}>Total</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#1D1B44" }}>{fmt(total)}</span>
        </div>
      </div>

      <Link href="/home" style={{ display: "block", marginTop: 32, textAlign: "center", height: 51, lineHeight: "51px", borderRadius: 18, background: "#7C3AED", color: "#fff", fontSize: 15, fontWeight: 700 }}>Continue to Groovp →</Link>
    </div>
  );
}
