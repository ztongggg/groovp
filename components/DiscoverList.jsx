"use client";

import { useState } from "react";
import DiscoverCard from "@/components/DiscoverCard";
import FilterPanel from "@/components/FilterPanel";

const EMPTY_FILTERS = { skills: [], interests: [], teamMin: 2, teamMax: 5, timelineStart: "", timelineEnd: "" };

// "Shapey" mascot, Figma node 1203:1377 (Empty - No Search Results), normalized to origin at the head's top-left
function Shapey() {
  return (
    <div className="relative" style={{ width: 213, height: 203 }}>
      <div className="absolute rounded-full" style={{ background: "#ffb800", left: 0, top: 0, width: 98.341, height: 98.341 }} />
      <div className="absolute" style={{ background: "#ffb800", left: 101.96, top: 119.31, width: 111.067, height: 83.3, borderTopLeftRadius: 104.125, borderTopRightRadius: 104.125 }} />
      <div className="absolute rounded-full" style={{ background: "#111827", left: 31.67, top: 39.48, width: 10.413, height: 19.669 }} />
      <div className="absolute rounded-full" style={{ background: "#111827", left: 67.54, top: 39.48, width: 10.413, height: 19.669 }} />
      <div className="absolute rounded-full" style={{ background: "#c2410c", left: 38.28, top: 60.56, width: 9.375, height: 20.625, transform: "rotate(90deg)" }} />
    </div>
  );
}

function matchesFilters(p, f) {
  if (f.skills.length && !f.skills.some((s) => (p.skills || []).includes(s))) return false;
  if (f.interests.length && !f.interests.some((s) => (p.interests || []).includes(s))) return false;
  if (f.teamMin != null && f.teamMax != null) {
    const min = p.minSize || 1, max = p.maxSize || 99;
    if (max < f.teamMin || min > f.teamMax) return false;
  }
  if (f.timelineStart && (!p.timelineStart || p.timelineStart < f.timelineStart)) return false;
  if (f.timelineEnd && (!p.timelineEnd || p.timelineEnd > f.timelineEnd)) return false;
  return true;
}

export default function DiscoverList({ items = [] }) {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [panelOpen, setPanelOpen] = useState(false);

  const teamSizeChanged = filters.teamMin !== EMPTY_FILTERS.teamMin || filters.teamMax !== EMPTY_FILTERS.teamMax;
  const activeFilterCount = filters.skills.length + filters.interests.length + (teamSizeChanged ? 1 : 0) + (filters.timelineStart ? 1 : 0) + (filters.timelineEnd ? 1 : 0);

  const query = q.trim().toLowerCase();
  const filtered = items
    .filter((p) => matchesFilters(p, filters))
    .filter((p) => {
      if (!query) return true;
      const hay = [p.title, p.desc, ...(p.skills || [])].join(" ").toLowerCase();
      return hay.includes(query);
    });

  return (
    <>
      {/* Search + filter */}
      <div className="mt-4 flex items-center gap-2 px-[30px]">
        <div className="flex flex-1 items-center" style={{ height: 42, borderRadius: 14, background: "#f5f0ff", border: "1px solid #ede9fe", paddingLeft: 15 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects…"
            className="ml-2.5 w-full bg-transparent focus:outline-none"
            style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search" className="px-3 text-[16px] text-muted">×</button>
          )}
        </div>
        <button onClick={() => setPanelOpen(true)} aria-label="Filters" className="relative flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 14, background: activeFilterCount ? "#7c3aed" : "#f5f0ff", border: activeFilterCount ? "none" : "1px solid #ede9fe" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={activeFilterCount ? "#fff" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
          {activeFilterCount > 0 && (
            <span className="absolute flex items-center justify-center rounded-full text-white" style={{ right: -4, top: -4, width: 18, height: 18, fontSize: 10, fontWeight: 800, background: "#bf4247" }}>{activeFilterCount}</span>
          )}
        </button>
      </div>

      <FilterPanel open={panelOpen} onClose={() => setPanelOpen(false)} value={filters} onApply={(f) => { setFilters(f); setPanelOpen(false); }} />

      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center px-8 text-center">
          <Shapey />
          <p className="mt-4 text-[19px] font-extrabold text-navy">No projects found</p>
          <p className="mt-1 text-[12.5px] text-muted">{query ? "Try different keywords or clear your filters to see more projects." : "Try clearing a filter or two."}</p>
          <button onClick={() => { setQ(""); setFilters(EMPTY_FILTERS); }} className="mt-4 rounded-full px-6 py-3 text-[13px] font-semibold text-navy" style={{ background: "#f3f1f8" }}>Clear filters</button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-6">
          {filtered.map((p, i) => (
            <DiscoverCard
              key={p.id}
              title={p.title}
              desc={p.desc}
              skills={p.skills}
              count={p.count}
              date={p.date}
              avatarColor={p.avatarColor}
              initials={p.initials}
              groupId={p.groupId}
              projectId={p.id}
              strongMatch={p.strongMatch}
              coverImageUrl={p.coverImageUrl}
            />
          ))}
        </div>
      )}
    </>
  );
}
