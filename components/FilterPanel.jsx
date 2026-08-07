"use client";

import { useState } from "react";
import SkillPicker from "@/components/SkillPicker";

const INTERESTS = ["Sustainability", "EdTech", "Web Dev", "Healthcare", "Data Science", "Social Impact", "Robotics", "AI & ML", "Design"];

function Chip({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className="rounded-[10px] px-4 py-2 text-[12px] font-semibold" style={{ background: active ? "#7c3aed" : "#f3f1f8", color: active ? "#fff" : "#1d1b44" }}>{children}</button>;
}

const inputCls = "w-full rounded-[14px] bg-[#f3f1f8] px-4 py-2.5 text-[13px] text-navy focus:outline-none";

const EMPTY = { skills: [], interests: [], teamMin: 2, teamMax: 5, timelineStart: "", timelineEnd: "" };

// Filter Panel (Figma node 616:1961) — skills/interests/team-size/timeline only,
// deliberately NO personality filter (spec: "filtering is for projects... not personality").
export default function FilterPanel({ open, onClose, value, onApply }) {
  const [d, setD] = useState(value || EMPTY);

  if (!open) return null;

  const toggle = (k, v) => setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="mx-auto flex max-h-[85vh] w-[402px] flex-col rounded-t-3xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center pt-2"><span className="rounded-full" style={{ width: 40, height: 4, background: "#ece8fc" }} /></div>
        <div className="flex items-center justify-between px-6 pt-3">
          <p className="text-[18px] font-extrabold text-navy">Filters</p>
          <button onClick={() => setD(EMPTY)} className="text-[13px] font-bold text-purple-600">Clear all</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Skills needed</p>
          <div className="mb-5">
            <SkillPicker selected={d.skills} onChange={(v) => setD((s) => ({ ...s, skills: v }))} />
          </div>

          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Interests needed</p>
          <div className="mb-5 flex flex-wrap gap-2">{INTERESTS.map((s) => <Chip key={s} active={d.interests.includes(s)} onClick={() => toggle("interests", s)}>{s}</Chip>)}</div>

          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Team size</p>
          <div className="mb-5 flex gap-3">
            {[["Min", "teamMin"], ["Max", "teamMax"]].map(([label, key]) => (
              <div key={key} className="flex flex-1 items-center justify-between rounded-2xl bg-[#f3f1f8] px-4 py-2.5">
                <span className="text-[11px] font-bold uppercase text-muted">{label}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setD((x) => ({ ...x, [key]: Math.max(1, x[key] - 1) }))} className="flex h-7 w-7 items-center justify-center rounded-full text-[16px] font-bold" style={{ background: "#ece8fc", color: "#7c3aed" }}>−</button>
                  <span className="w-4 text-center text-[15px] font-bold text-navy">{d[key]}</span>
                  <button type="button" onClick={() => setD((x) => ({ ...x, [key]: Math.min(50, x[key] + 1) }))} className="flex h-7 w-7 items-center justify-center rounded-full text-[16px] font-bold" style={{ background: "#ece8fc", color: "#7c3aed" }}>+</button>
                </div>
              </div>
            ))}
          </div>

          <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Timeline</p>
          <div className="mb-2 flex gap-3">
            <div className="flex-1"><p className="mb-1 text-[11px] font-semibold text-muted">Start after</p><input type="date" className={inputCls} value={d.timelineStart} onChange={(e) => setD((x) => ({ ...x, timelineStart: e.target.value }))} /></div>
            <div className="flex-1"><p className="mb-1 text-[11px] font-semibold text-muted">End before</p><input type="date" className={inputCls} value={d.timelineEnd} onChange={(e) => setD((x) => ({ ...x, timelineEnd: e.target.value }))} /></div>
          </div>
        </div>

        <div className="border-t border-line px-6 py-4">
          <button onClick={() => onApply(d)} className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white" style={{ background: "#7c3aed" }}>Apply Filters</button>
        </div>
      </div>
    </div>
  );
}
