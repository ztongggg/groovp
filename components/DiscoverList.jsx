"use client";

import { useState } from "react";
import DiscoverCard from "@/components/DiscoverCard";
import FilterPanel from "@/components/FilterPanel";

const EMPTY_FILTERS = { skills: [], interests: [], teamMin: 2, teamMax: 5, timelineStart: "", timelineEnd: "" };

// Real Figma export, Empty - No Search Results, replaces the earlier CSS-shape approximation.
function Shapey() {
  return <img src="/discover-empty-shapey.png" alt="" style={{ width: 282.3, height: 282.3 }} />;
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
        <button onClick={() => setPanelOpen(true)} aria-label="Filters" className="relative flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 14, background: "#7c3aed" }}>
          {/* two sliders, per the Figma icon */}
          <svg width="21" height="16" viewBox="0 0 21 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M0 5h21M0 11h21" />
            <circle cx="14" cy="5" r="3" fill="#7c3aed" />
            <circle cx="5" cy="11" r="3" fill="#7c3aed" />
          </svg>
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
              memberCount={p.memberCount}
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
