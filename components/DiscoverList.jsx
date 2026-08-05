"use client";

import { useState } from "react";
import DiscoverCard from "@/components/DiscoverCard";
import FilterPanel from "@/components/FilterPanel";

const EMPTY_FILTERS = { skills: [], interests: [], teamSize: "", timelineStart: "", timelineEnd: "" };

function matchesFilters(p, f) {
  if (f.skills.length && !f.skills.some((s) => (p.skills || []).includes(s))) return false;
  if (f.interests.length && !f.interests.some((s) => (p.interests || []).includes(s))) return false;
  if (f.teamSize) {
    const max = p.maxSize || 0;
    if (f.teamSize === "1-3" && !(max >= 1 && max <= 3)) return false;
    if (f.teamSize === "4-6" && !(max >= 4 && max <= 6)) return false;
    if (f.teamSize === "7+" && !(max >= 7)) return false;
  }
  if (f.timelineStart && (!p.timelineStart || p.timelineStart < f.timelineStart)) return false;
  if (f.timelineEnd && (!p.timelineEnd || p.timelineEnd > f.timelineEnd)) return false;
  return true;
}

export default function DiscoverList({ items = [] }) {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [panelOpen, setPanelOpen] = useState(false);

  const activeFilterCount = filters.skills.length + filters.interests.length + (filters.teamSize ? 1 : 0) + (filters.timelineStart ? 1 : 0) + (filters.timelineEnd ? 1 : 0);

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
        <div className="mt-16 px-8 text-center">
          <p className="text-[15px] font-semibold text-navy">{query ? `No projects match "${q}".` : "No projects match these filters."}</p>
          <p className="mt-1 text-[13px] text-muted">{query ? "Try a different keyword." : "Try clearing a filter or two."}</p>
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
