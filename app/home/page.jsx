"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import HomeProjectCard from "@/components/HomeProjectCard";

const RECENT = [
  { title: "NeuralLink Study Bot", desc: "Building an AI-driven study companion using Python and OpenAI for local university students.", skills: ["Python", "AI/ML", "FastAPI"], count: "2/5", date: "01/08/2026 - 15/12/2026" },
  { title: "EcoTrack", desc: "A sustainability tracker helping students monitor and reduce their campus carbon footprint.", skills: ["React", "Sustainability", "Node.js"], count: "3/5", date: "05/09/2026 - 20/12/2026" },
  { title: "Campus Marketplace", desc: "A peer-to-peer marketplace app for students to buy, sell, and trade items on campus.", skills: ["Web Dev", "UI/UX", "SQL"], count: "4/6", date: "12/08/2026 - 30/11/2026" },
  { title: "Study Buddy Matcher", desc: "Matching students into study groups based on courses, schedules, and learning styles.", skills: ["Figma", "EdTech", "Python"], count: "2/4", date: "01/09/2026 - 15/12/2026" },
];

const POPULAR = [
  { title: "Smart Attendance System", desc: "Using facial recognition to automate attendance tracking for large lecture halls.", skills: ["Python", "Computer Vision", "Flask"], count: "3/6", date: "10/08/2026 - 18/12/2026", badge: "Strong applicant" },
  { title: "Peer Code Review Bot", desc: "A Slack bot that pairs students for code reviews and tracks feedback quality over time.", skills: ["TypeScript", "Node.js", "Slack API"], count: "2/5", date: "01/09/2026 - 10/12/2026" },
  { title: "Campus Event Finder", desc: "Aggregating club and society events across campus into one searchable calendar app.", skills: ["React", "Firebase", "UI/UX"], count: "4/5", date: "15/08/2026 - 22/12/2026" },
  { title: "Mental Health Check-in App", desc: "A daily mood check-in tool connecting students with campus counselling resources.", skills: ["Swift", "Healthcare", "Design"], count: "3/4", date: "05/09/2026 - 30/11/2026" },
];

function GreetingBanner() {
  return (
    <div className="relative overflow-hidden" style={{ height: 178, borderRadius: 24, background: "#1e1b4b" }}>
      {/* dots */}
      {[[20, 22], [38, 22], [20, 40], [38, 40]].map(([l, t], i) => (
        <span key={i} className="absolute rounded-full" style={{ left: l, top: t, width: 9, height: 9, background: "#f472b6" }} />
      ))}
      <div className="absolute" style={{ left: 20, top: 90, fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: "36px" }}>Aiden Tan</div>
      <div className="absolute" style={{ left: 20, top: 130, fontSize: 12.5, fontWeight: 600, color: "#c7c3e0" }}>Ready to find your next project?</div>

      {/* blob face */}
      <div className="absolute rounded-full" style={{ left: 222, top: 50, width: 150, height: 150, background: "#e8a99f" }} />
      {/* antenna */}
      <span className="absolute" style={{ left: 300, top: 40, width: 2, height: 14, background: "#1f1a26" }} />
      <span className="absolute rounded-full" style={{ left: 296, top: 34, width: 10, height: 10, background: "#e8a99f", border: "2px solid #1f1a26" }} />
      {/* glasses */}
      <span className="absolute rounded-full" style={{ left: 266, top: 85, width: 30, height: 30, border: "2px solid #14121a" }} />
      <span className="absolute rounded-full" style={{ left: 298, top: 83, width: 34, height: 34, border: "2px solid #14121a" }} />
      <span className="absolute" style={{ left: 296, top: 99, width: 4, height: 2, background: "#14121a" }} />
      {/* eyes */}
      <span className="absolute rounded-full" style={{ left: 279, top: 98, width: 5, height: 5, background: "#14121a" }} />
      <span className="absolute rounded-full" style={{ left: 313, top: 98, width: 5, height: 5, background: "#14121a" }} />
      {/* smile */}
      <span className="absolute" style={{ left: 291, top: 120, width: 12, height: 6, borderBottom: "2px solid #14121a", borderRadius: "0 0 8px 8px" }} />
    </div>
  );
}

function ShortcutButton({ label, children }) {
  return (
    <button className="flex flex-1 items-center gap-3" style={{ height: 44, borderRadius: 14, background: "#1e1b4b", paddingLeft: 18 }}>
      {children}
      <span style={{ fontSize: 12.5, fontWeight: 800, color: "#fff" }}>{label}</span>
    </button>
  );
}

export default function HomePage() {
  const [feed, setFeed] = useState("popular");

  return (
    <AppShell>
      <div className="bg-white pb-3">
        <StatusBar />

        {/* Greeting */}
        <div className="px-5">
          <div className="mt-2">
            <GreetingBanner />
          </div>
        </div>

        {/* Shortcuts */}
        <div className="mt-3 flex gap-4 px-[30px]">
          <ShortcutButton label="Saved">
            <svg width="12" height="15" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12v18l-6-4-6 4V3Z" />
            </svg>
          </ShortcutButton>
          <ShortcutButton label="Requests">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" />
            </svg>
          </ShortcutButton>
        </div>

        {/* Recently viewed */}
        <h2 className="mt-4 px-[30px]" style={{ fontSize: 20, fontWeight: 800, color: "#434343" }}>Recently viewed</h2>
        <div className="mt-[18px] flex gap-[14px] overflow-x-auto px-[30px] pb-2">
          {RECENT.map((p) => (
            <HomeProjectCard key={p.title} {...p} members={["JK"]} join="purple" />
          ))}
        </div>

        {/* Popular / Latest */}
        <div className="mt-[18px] px-[30px]">
          <div className="relative flex" style={{ height: 46, borderRadius: 999, background: "#ececf3", padding: 4 }}>
            <div
              className="absolute rounded-full bg-white"
              style={{ left: feed === "popular" ? 4 : 175, top: 4, width: 163, height: 38, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", transition: "left .2s" }}
            />
            <button onClick={() => setFeed("popular")} className="relative flex-1" style={{ fontSize: 13, fontWeight: 800, color: feed === "popular" ? "#7c3aed" : "#8b8b99" }}>Popular</button>
            <button onClick={() => setFeed("latest")} className="relative flex-1" style={{ fontSize: 13, fontWeight: 800, color: feed === "latest" ? "#7c3aed" : "#8b8b99" }}>Latest</button>
          </div>
        </div>

        {/* Popular feed */}
        <div className="mt-[23px] flex gap-[14px] overflow-x-auto px-[30px] pb-2">
          {POPULAR.map((p) => (
            <HomeProjectCard key={p.title} {...p} members={["JK"]} join="green" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
