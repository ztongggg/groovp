"use client";

import { useState } from "react";

const SKILLS = ["Python", "React", "TypeScript", "Node.js", "SQL", "Figma", "UI/UX", "Java", "AI/ML", "FastAPI", "Design", "Research"];
const INTERESTS = ["Sustainability", "EdTech", "Web Dev", "Healthcare", "Data Science", "Social Impact", "Robotics", "AI & ML", "Design"];

function Chip({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className="rounded-[10px] px-4 py-2 text-[12px] font-semibold" style={{ background: active ? "#7c3aed" : "#f3f1f8", color: active ? "#fff" : "#1d1b44" }}>{children}</button>;
}

const inputCls = "w-full rounded-[14px] bg-[#f3f1f8] px-4 py-2.5 text-[13px] text-navy focus:outline-none";

const EMPTY = { skills: [], interests: [], teamSize: "", timelineStart: "", timelineEnd: "" };

// Filter Panel (Figma node 616:1961) — skills/interests/team-size/timeline only,
// deliberately NO personality filter (spec: "filtering is for projects... not personality").
export default function FilterPanel({ open, onClose, value, onApply }) {
  const [d, setD] = useState(value || EMPTY);

  if (!open) return null;

  const toggle = (k, v) => setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="mx-auto flex max-h-[85vh] w-[402px] flex-col rounded-t-3xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5">
          <p className="text-[18px] font-extrabold text-navy">Filters</p>
          <button onClick={onClose} className="text-[20px] text-muted">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Skills needed</p>
          <div className="mb-5 flex flex-wrap gap-2">{SKILLS.map((s) => <Chip key={s} active={d.skills.includes(s)} onClick={() => toggle("skills", s)}>{s}</Chip>)}</div>

          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Interests needed</p>
          <div className="mb-5 flex flex-wrap gap-2">{INTERESTS.map((s) => <Chip key={s} active={d.interests.includes(s)} onClick={() => toggle("interests", s)}>{s}</Chip>)}</div>

          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Team size</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {["1-3", "4-6", "7+"].map((s) => <Chip key={s} active={d.teamSize === s} onClick={() => setD((x) => ({ ...x, teamSize: x.teamSize === s ? "" : s }))}>{s}</Chip>)}
          </div>

          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Timeline</p>
          <div className="mb-2 flex gap-3">
            <div className="flex-1"><p className="mb-1 text-[11px] font-semibold text-muted">Start after</p><input type="date" className={inputCls} value={d.timelineStart} onChange={(e) => setD((x) => ({ ...x, timelineStart: e.target.value }))} /></div>
            <div className="flex-1"><p className="mb-1 text-[11px] font-semibold text-muted">End before</p><input type="date" className={inputCls} value={d.timelineEnd} onChange={(e) => setD((x) => ({ ...x, timelineEnd: e.target.value }))} /></div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-line px-6 py-4">
          <button onClick={() => { setD(EMPTY); onApply(EMPTY); }} className="flex-1 rounded-2xl py-3 text-[14px] font-bold text-navy" style={{ background: "#f3f1f8" }}>Clear</button>
          <button onClick={() => onApply(d)} className="flex-1 rounded-2xl py-3 text-[14px] font-bold text-white" style={{ background: "#7c3aed" }}>Apply</button>
        </div>
      </div>
    </div>
  );
}
