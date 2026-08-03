"use client";

import { useState } from "react";
import Link from "next/link";
import JoinGroupButton from "@/components/JoinGroupButton";

const AVATAR = ["#e8863b", "#34b9a8", "#f2a5bd", "#7c3aed", "#4ac7b2"];

export default function ProjectDetailView({ name, description, type, ownerUsername, dateRange, skills = [], memberCount, maxSize, groups = [], meId }) {
  const [tab, setTab] = useState("info");
  const totalMembers = groups.reduce((n, g) => n + (g.members?.length || 0), 0);

  return (
    <div className="relative w-[402px] bg-white pb-28">
      {/* navy cover banner */}
      <div className="relative" style={{ height: 260, background: "#1e1b4b" }}>
        <Link href="/discover" className="absolute left-5 top-14 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-[18px] text-white">‹</Link>
        <span className="absolute right-5 top-14 flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2.4" /><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="19" r="2.4" /><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" /></svg>
        </span>
        <div className="absolute" style={{ left: 34, top: 103, width: 334, height: 130, borderRadius: 16, background: "#d9d9d9" }} />
      </div>

      {/* overlapping content card */}
      <div className="relative -mt-7 rounded-t-[28px] bg-white px-9 pt-7">
        <span className="mb-3 inline-block rounded-full bg-purple-100 px-3 py-1 text-[11px] font-bold text-purple-600">{type === "personal" ? "Personal" : "🎓 Academic"}</span>
        <h1 className="text-[20px] font-extrabold text-navy">{name}</h1>
        <p className="mt-2 text-[15px] leading-snug text-[#434343]">{description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <span key={s} className="rounded-lg px-3 py-1 text-[10px] font-bold" style={{ background: i === 0 ? "#7c3aed" : "#f5f0ff", color: i === 0 ? "#fff" : "#7c3aed" }}>{s}</span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[13px] text-muted">by @{ownerUsername}</p>
          <p className="text-[12px] font-semibold text-muted">{memberCount} members</p>
        </div>
        {dateRange.trim() !== "-" && <p className="mt-1 text-[12px] text-muted">{dateRange}</p>}

        {/* Info / Groups tabs */}
        <div className="mt-5 flex rounded-full bg-[#ececf3] p-1">
          {[["info", "Info"], ["groups", "Groups"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className="flex-1 rounded-full py-2.5 text-[13px] font-bold" style={tab === k ? { background: "#fff", color: "#7c3aed" } : { color: "#8b8b99" }}>{l}</button>
          ))}
        </div>

        {tab === "info" ? (
          <div className="mt-5 flex flex-col gap-4">
            <div className="rounded-2xl bg-[#f3f1f8] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Timeline</p>
              <p className="mt-1 text-[14px] font-semibold text-navy">{dateRange.trim() === "-" ? "To be decided" : dateRange}</p>
            </div>
            <div className="rounded-2xl bg-[#f9f7ff] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Things to note</p>
              <p className="mt-1 text-[14px] text-navy">Reach out with a short intro when you request to join — it helps the leader decide.</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Groups open · {groups.length}</p>
            {groups.map((g) => {
              const members = g.members || [];
              const full = members.length >= (maxSize || 99);
              const isLeader = meId && meId === g.leaderId;
              return (
                <div key={g.id} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-bold text-navy">{g.name}</p>
                    <span className="text-[13px] font-semibold text-muted">{members.length}/{maxSize} members</span>
                  </div>
                  <p className="mt-1 text-[12px] font-semibold" style={{ color: g.recruiting ? "#298c52" : "#9ca3af" }}>
                    {g.recruiting ? (g.membersWanted > 0 ? `Open — looking for ${g.membersWanted} more` : "Open to requests") : "Not recruiting"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {members.slice(0, 5).map((m, i) => (
                        <Link key={m.user_id} href={`/u/${m.user_id}`} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white" style={{ background: AVATAR[i % AVATAR.length] }}>
                          {(m.name || "?").slice(0, 2).toUpperCase()}
                        </Link>
                      ))}
                    </div>
                    {isLeader ? (
                      <Link href={`/recruiting/${g.id}`} className="rounded-xl bg-[#f3f1f8] px-4 py-2 text-[13px] font-bold text-purple-600">Manage ›</Link>
                    ) : !g.recruiting ? (
                      <span className="rounded-xl bg-[#f3f1f8] px-4 py-2 text-[13px] font-bold text-muted">Closed</span>
                    ) : (
                      <JoinGroupButton groupId={g.id} full={full} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* sticky bottom bar */}
      <div className="fixed bottom-0 left-1/2 z-20 flex w-[402px] -translate-x-1/2 justify-center border-t border-line bg-white px-6 py-3">
        {tab === "info" ? (
          <button onClick={() => setTab("groups")} className="w-full rounded-2xl py-3.5 text-[15px] font-bold text-white" style={{ background: "#7c3aed" }}>See groups to join</button>
        ) : groups[0] ? (
          <div className="w-full"><JoinGroupButton groupId={groups[0].id} /></div>
        ) : null}
      </div>
    </div>
  );
}
