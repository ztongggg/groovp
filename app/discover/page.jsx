"use client";

import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="2.4" /><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="19" r="2.4" />
      <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 24 22" fill="none" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" />
    </svg>
  );
}

// Discover project card — exact 334x357.
function DiscoverCard({ title, desc, skills, avatarColor, initials, count, date }) {
  return (
    <div className="relative" style={{ width: 334, height: 357, borderRadius: 21, background: "#fff", border: "1px solid #e4e3e3" }}>
      <div className="absolute left-0 top-0" style={{ width: 334, height: 90, background: "#d9d9d9", borderTopLeftRadius: 21, borderTopRightRadius: 21 }} />
      <div className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 259, top: 13, width: 27, height: 27 }}><ShareIcon /></div>
      <div className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 294, top: 13, width: 27, height: 27 }}><HeartIcon /></div>

      <div className="absolute" style={{ left: 14, top: 109, fontSize: 16, fontWeight: 800, color: "#1e1b4b" }}>{title}</div>
      <div className="absolute" style={{ left: 15, top: 130, width: 303, fontSize: 13, fontWeight: 600, color: "#4b5563", lineHeight: "16px" }}>{desc}</div>

      <div className="absolute flex gap-[5px]" style={{ left: 15, top: 175 }}>
        {skills.map((s, i) => (
          <span key={s} className="inline-flex items-center" style={{ height: 23, padding: "0 12px", borderRadius: 16, fontSize: 10, fontWeight: 800, background: i === 0 ? "#7c3aed" : "#f5f0ff", color: i === 0 ? "#fff" : "#7c3aed" }}>{s}</span>
        ))}
      </div>

      <div className="absolute flex -space-x-1.5" style={{ left: 16, top: 211 }}>
        <span style={{ width: 23, height: 23, borderRadius: 999, background: avatarColor, border: "1px solid #fff" }} />
        <span className="inline-flex items-center justify-center" style={{ width: 23, height: 23, borderRadius: 999, background: "#7c3aed", border: "1px solid #fff", fontSize: 10, fontWeight: 800, color: "#fff" }}>{initials}</span>
      </div>
      <div className="absolute" style={{ right: 12, top: 215, fontSize: 10, fontWeight: 700, color: "#6b7280" }}>{count} members</div>

      <div className="absolute" style={{ left: 15, top: 250, width: 307, height: 2, background: "#e5e7eb", borderRadius: 2 }}>
        <div style={{ width: 118, height: 2, background: "#7c3aed", borderRadius: 2 }} />
      </div>
      <div className="absolute" style={{ left: 15, top: 261, fontSize: 12, fontWeight: 700, color: "#6b7280" }}>{date}</div>

      <button className="absolute flex items-center justify-center" style={{ left: 15, top: 294, width: 306, height: 42, borderRadius: 14, background: "#dcf674" }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#5f7900" }}>Request</span>
      </button>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <AppShell>
      <div className="relative w-[402px] bg-white" style={{ height: 925 }}>
        <div className="absolute inset-x-0 top-0"><StatusBar /></div>

        {/* Heading */}
        <div className="absolute" style={{ left: 24, top: 59, fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Discover</div>
        {/* Add */}
        <button className="absolute flex items-center justify-center rounded-full" style={{ left: 341, top: 60, width: 32, height: 32, background: "#7c3aed" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>

        {/* Search */}
        <div className="absolute flex items-center" style={{ left: 30, top: 106, width: 296, height: 42, borderRadius: 14, background: "#f5f0ff", border: "1px solid #ede9fe", paddingLeft: 15 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
          <input placeholder="Search projects…" className="ml-2.5 w-full bg-transparent focus:outline-none" style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }} />
        </div>
        {/* Filter */}
        <button className="absolute flex items-center justify-center" style={{ left: 336, top: 106, width: 42, height: 42, borderRadius: 14, background: "#7c3aed" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M4 8h16M4 16h16" />
            <circle cx="15" cy="8" r="2.4" fill="#7c3aed" /><circle cx="9" cy="16" r="2.4" fill="#7c3aed" />
          </svg>
        </button>

        {/* Cards */}
        <div className="absolute" style={{ left: 34, top: 184 }}>
          <DiscoverCard title="NeuralLink Study Bot" desc="Building an AI-driven study companion using Python and OpenAI for local university students." skills={["Python", "AI/ML", "FastAPI"]} avatarColor="#e8863b" initials="JK" count="2/5" date="01/08/2026 - 15/12/2026" />
        </div>
        <div className="absolute" style={{ left: 34, top: 560 }}>
          <DiscoverCard title="HealthMate Platform" desc="Creating a web platform for remote health monitoring using IoT devices for better patient care." skills={["Java", "HealthTech", "Spring Boot"]} avatarColor="#e8863b" initials="AB" count="4/8" date="15/02/2027 - 15/11/2027" />
        </div>
      </div>
    </AppShell>
  );
}
