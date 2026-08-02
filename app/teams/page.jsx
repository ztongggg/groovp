"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";

// Colored blob avatar — 48x48 r14 with simple white face (per Figma).
function AvatarBlob({ color }) {
  return (
    <div className="relative" style={{ width: 48, height: 48, borderRadius: 14, background: color }}>
      <span className="absolute rounded-full bg-white" style={{ left: 9, top: 18, width: 7, height: 7 }} />
      <span className="absolute rounded-full bg-white" style={{ left: 33, top: 18, width: 7, height: 7 }} />
      <span className="absolute rounded-full bg-white" style={{ left: 17, top: 28, width: 14, height: 3 }} />
    </div>
  );
}

function RequestRow({ top, color, title, subtitle, applied, status, statusBg, statusColor }) {
  return (
    <div className="absolute" style={{ left: 24, top, width: 354, height: 92, borderRadius: 18, background: "#fff", border: "1px solid #f3f1f8" }}>
      <div className="absolute" style={{ left: 16, top: 22 }}>
        <AvatarBlob color={color} />
      </div>
      <div className="absolute" style={{ left: 76, top: 16, fontSize: 13.5, fontWeight: 700, color: "#1d1b44" }}>{title}</div>
      <div className="absolute" style={{ left: 76, top: 36, fontSize: 11, fontWeight: 400, color: "#757080" }}>{subtitle}</div>
      <div className="absolute" style={{ left: 76, top: 56, fontSize: 10, fontWeight: 400, color: "#757080" }}>{applied}</div>
      <div className="absolute flex items-center" style={{ right: 18, top: 33, height: 26, padding: "0 15px", borderRadius: 13, background: statusBg }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: statusColor }}>{status}</span>
      </div>
    </div>
  );
}

const ROWS = [
  { top: 150, color: "#4ac7b2", title: "Group C — “Data Wizards”", subtitle: "NeuralLink Study Bot", applied: "Applied 2 days ago", status: "Pending", statusBg: "#fce5b8", statusColor: "#99730d" },
  { top: 258, color: "#f2a5bd", title: "CityMap AI", subtitle: "Group A", applied: "Applied 5 days ago", status: "Declined", statusBg: "#fae0e0", statusColor: "#bf4247" },
  { top: 366, color: "#f29c38", title: "Campus Radio App", subtitle: "Group B", applied: "Applied 1 week ago", status: "Accepted", statusBg: "#d4f2de", statusColor: "#298c52" },
];

export default function TeamsPage() {
  const [tab, setTab] = useState("requested");

  return (
    <AppShell>
      <div className="relative w-[402px]" style={{ minHeight: 794, background: "#f9f8fb" }}>
        {/* Header */}
        <div className="absolute" style={{ left: 24, top: 48, fontSize: 26, fontWeight: 800, color: "#1d1b44" }}>Messages</div>
        <button className="absolute flex items-center justify-center" style={{ left: 334, top: 44, width: 44, height: 44, borderRadius: 22, background: "#f3f1f8" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
        </button>

        {/* Tabs */}
        <button onClick={() => setTab("my")} className="absolute flex items-center justify-center" style={{ left: 24, top: 100, width: 82, height: 36, borderRadius: 18, background: tab === "my" ? "#7c3aed" : "#f3f1f8" }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: tab === "my" ? "#fff" : "#1d1b44" }}>My Teams</span>
        </button>
        <button onClick={() => setTab("requested")} className="absolute flex items-center justify-center" style={{ left: 114, top: 100, width: 89, height: 36, borderRadius: 18, background: tab === "requested" ? "#7c3aed" : "#f3f1f8" }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: tab === "requested" ? "#fff" : "#1d1b44" }}>Requested</span>
        </button>

        {/* Rows */}
        {tab === "requested" ? (
          ROWS.map((r) => <RequestRow key={r.title} {...r} />)
        ) : (
          <div className="absolute" style={{ left: 24, top: 200, fontSize: 13, color: "#757080" }}>Your teams will appear here.</div>
        )}
      </div>
    </AppShell>
  );
}
