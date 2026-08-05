"use client";

import { useState } from "react";
import DiscoverCard from "@/components/DiscoverCard";

export default function DiscoverList({ items = [] }) {
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const filtered = !query
    ? items
    : items.filter((p) => {
        const hay = [p.title, p.desc, ...(p.skills || [])].join(" ").toLowerCase();
        return hay.includes(query);
      });

  return (
    <>
      {/* Search (wired) */}
      <div className="mt-4 px-[30px]">
        <div className="flex items-center" style={{ height: 42, borderRadius: 14, background: "#f5f0ff", border: "1px solid #ede9fe", paddingLeft: 15 }}>
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
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 px-8 text-center">
          <p className="text-[15px] font-semibold text-navy">No projects match “{q}”.</p>
          <p className="mt-1 text-[13px] text-muted">Try a different keyword.</p>
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
