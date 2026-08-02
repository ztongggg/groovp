"use client";

import { useState } from "react";

function AvatarBlob({ color }) {
  return (
    <div className="relative" style={{ width: 48, height: 48, borderRadius: 14, background: color }}>
      <span className="absolute rounded-full bg-white" style={{ left: 9, top: 18, width: 7, height: 7 }} />
      <span className="absolute rounded-full bg-white" style={{ left: 33, top: 18, width: 7, height: 7 }} />
      <span className="absolute rounded-full bg-white" style={{ left: 17, top: 28, width: 14, height: 3 }} />
    </div>
  );
}

const STATUS = {
  pending: { label: "Pending", bg: "#fce5b8", color: "#99730d" },
  accepted: { label: "Accepted", bg: "#d4f2de", color: "#298c52" },
  declined: { label: "Declined", bg: "#fae0e0", color: "#bf4247" },
};
const COLORS = ["#4ac7b2", "#f2a5bd", "#f29c38", "#7c3aed"];

function RequestRow({ top, color, title, subtitle, applied, status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <div className="absolute" style={{ left: 24, top, width: 354, height: 92, borderRadius: 18, background: "#fff", border: "1px solid #f3f1f8" }}>
      <div className="absolute" style={{ left: 16, top: 22 }}>
        <AvatarBlob color={color} />
      </div>
      <div className="absolute" style={{ left: 76, top: 16, width: 190, fontSize: 13.5, fontWeight: 700, color: "#1d1b44", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      <div className="absolute" style={{ left: 76, top: 36, fontSize: 11, fontWeight: 400, color: "#757080" }}>{subtitle}</div>
      <div className="absolute" style={{ left: 76, top: 56, fontSize: 10, fontWeight: 400, color: "#757080" }}>{applied}</div>
      <div className="absolute flex items-center" style={{ right: 18, top: 33, height: 26, padding: "0 15px", borderRadius: 13, background: s.bg }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
      </div>
    </div>
  );
}

export default function TeamsView({ requests = [] }) {
  const [tab, setTab] = useState("requested");

  return (
    <div className="relative w-[402px]" style={{ minHeight: 794, background: "#f9f8fb" }}>
      <div className="absolute" style={{ left: 24, top: 48, fontSize: 26, fontWeight: 800, color: "#1d1b44" }}>Messages</div>
      <button className="absolute flex items-center justify-center" style={{ left: 334, top: 44, width: 44, height: 44, borderRadius: 22, background: "#f3f1f8" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
      </button>

      <button onClick={() => setTab("my")} className="absolute flex items-center justify-center" style={{ left: 24, top: 100, width: 82, height: 36, borderRadius: 18, background: tab === "my" ? "#7c3aed" : "#f3f1f8" }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: tab === "my" ? "#fff" : "#1d1b44" }}>My Teams</span>
      </button>
      <button onClick={() => setTab("requested")} className="absolute flex items-center justify-center" style={{ left: 114, top: 100, width: 89, height: 36, borderRadius: 18, background: tab === "requested" ? "#7c3aed" : "#f3f1f8" }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: tab === "requested" ? "#fff" : "#1d1b44" }}>Requested</span>
      </button>

      {tab === "requested" ? (
        requests.length === 0 ? (
          <div className="absolute" style={{ left: 24, top: 200, fontSize: 13, color: "#757080" }}>No requests yet. Request to join a project from Discover.</div>
        ) : (
          requests.map((r, i) => (
            <RequestRow key={r.id} top={150 + i * 108} color={COLORS[i % COLORS.length]} title={r.title} subtitle={r.subtitle} applied={r.applied} status={r.status} />
          ))
        )
      ) : (
        <div className="absolute" style={{ left: 24, top: 200, fontSize: 13, color: "#757080" }}>Your teams will appear here.</div>
      )}
    </div>
  );
}
