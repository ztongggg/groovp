import { getAllExperimentResults } from "@/lib/experiment";

// EXPERIMENT: owner-only aggregate view across every participant —
// admin-gated inside getAllExperimentResults() (profiles.is_admin, same
// pattern as /moderation). Not linked from anywhere in the app; visit
// directly. See lib/experiment.js for the removal checklist.

const TASK_LABEL = { 1: "Profile", 2: "Join team", 3: "Own project", 4: "Accept applicant" };
const STATUS_STYLE = {
  done: { bg: "#D9F2E0", color: "#298C52" },
  in_progress: { bg: "#FCE5B8", color: "#99730D" },
  abandoned: { bg: "#FCDEDE", color: "#BF4247" },
  not_started: { bg: "#F3F1F8", color: "#757080" },
};

function fmt(seconds) {
  if (seconds == null) return "—";
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default async function ExperimentAdminPage() {
  const results = await getAllExperimentResults();

  if (results === null) {
    return <div style={{ padding: 40, fontSize: 14, color: "#1D1B44" }}>Not authorized.</div>;
  }

  return (
    <div style={{ padding: 24, minWidth: 900, fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1D1B44" }}>Web Experiment — all sessions ({results.length})</h1>
      <p style={{ marginTop: 4, fontSize: 12, color: "#757080" }}>A task open 20+ minutes with no end is shown as abandoned, not in progress.</p>

      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #EAE5FC" }}>
              <th style={{ padding: "8px 10px" }}>Participant</th>
              <th style={{ padding: "8px 10px" }}>Condition</th>
              <th style={{ padding: "8px 10px" }}>Started</th>
              {[1, 2, 3, 4].map((n) => (
                <th key={n} style={{ padding: "8px 10px" }}>
                  T{n} · {TASK_LABEL[n]}
                </th>
              ))}
              <th style={{ padding: "8px 10px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const total = r.tasks.every((t) => t.status === "done") ? r.tasks.reduce((s, t) => s + t.seconds, 0) : null;
              return (
                <tr key={r.sessionId} style={{ borderBottom: "1px solid #F3F1F8" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1D1B44" }}>{r.participant}</td>
                  <td style={{ padding: "8px 10px", color: "#757080" }}>{r.condition}</td>
                  <td style={{ padding: "8px 10px", color: "#757080" }}>{new Date(r.createdAt).toLocaleString()}</td>
                  {r.tasks.map((t) => {
                    const s = STATUS_STYLE[t.status];
                    return (
                      <td key={t.task} style={{ padding: "8px 10px" }}>
                        <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 999, background: s.bg, color: s.color, fontWeight: 600, fontSize: 11 }}>
                          {t.status === "done" ? fmt(t.seconds) : t.status.replace("_", " ")}
                        </span>
                      </td>
                    );
                  })}
                  <td style={{ padding: "8px 10px", fontWeight: 700, color: "#1D1B44" }}>{fmt(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
