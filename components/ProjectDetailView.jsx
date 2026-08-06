"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import JoinGroupButton from "@/components/JoinGroupButton";
import FavoriteButton from "@/components/FavoriteButton";
import { enrolInProject } from "@/app/join/actions";

const AVATAR = ["#e8863b", "#34b9a8", "#f2a5bd", "#7c3aed", "#4ac7b2"];

function ShareCard({ code }) {
  const [copied, setCopied] = useState(""); // "code" | "link" | ""

  async function copy(what) {
    const link = typeof window !== "undefined" ? `${window.location.origin}/join?code=${code}` : "";
    try {
      await navigator.clipboard.writeText(what === "link" ? link : code);
      setCopied(what);
      setTimeout(() => setCopied(""), 1600);
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-dashed border-purple-300 bg-[#f9f7ff] p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Share to invite classmates</p>
      <p className="mt-1 text-[22px] font-extrabold tracking-wider text-navy">{code}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => copy("code")} className="flex-1 rounded-xl py-2 text-[13px] font-bold text-white" style={{ background: "#7c3aed" }}>
          {copied === "code" ? "Copied ✓" : "Copy code"}
        </button>
        <button onClick={() => copy("link")} className="flex-1 rounded-xl py-2 text-[13px] font-bold text-purple-600" style={{ background: "#ece8fc" }}>
          {copied === "link" ? "Copied ✓" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

export default function ProjectDetailView({ name, description, type, ownerUsername, dateRange, skills = [], memberCount, maxSize, groups = [], meId, projectId, favorited, joinCode, enrolled, isOwner, allowMultipleGroups, coverImageUrl, numberOfGroups }) {
  const [tab, setTab] = useState("info");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState("");
  const canShare = enrolled || isOwner;

  function enrol() {
    setErr("");
    start(async () => {
      const res = await enrolInProject(projectId);
      if (res?.error) setErr(res.error);
      else router.refresh();
    });
  }


  return (
    <div className="font-nunito relative w-[402px] bg-white pb-28">
      {/* full-bleed cover banner */}
      <div className="relative" style={{ height: 220 }}>
        {coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: "#d9d9d9" }} />
        )}
        <Link href="/discover" className="absolute left-5 top-14 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[18px] text-navy shadow">‹</Link>
        <div className="absolute right-5 top-14 flex items-center gap-2">
          {isOwner && (
            <Link href={`/project/${projectId}/edit`} aria-label="Edit project" className="flex h-9 items-center justify-center rounded-full bg-white px-3.5 text-[13px] font-bold text-navy shadow">✎ Edit</Link>
          )}
          <FavoriteButton projectId={projectId} initial={favorited} />
        </div>
        <span className="absolute bottom-3 left-5 inline-block rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ background: type === "personal" ? "#7c3aed" : "#e0546a" }}>{type === "personal" ? "Personal" : "🎓 Academic"}</span>
      </div>

      {/* overlapping content card */}
      <div className="relative -mt-7 rounded-t-[28px] bg-white px-9 pt-7">
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

        {err && <p className="mt-3 text-[13px] font-semibold text-[#bf4247]">{err}</p>}

        {tab === "info" ? (
          <div className="mt-5 flex flex-col gap-4">
            {canShare && joinCode && <ShareCard code={joinCode} />}
            {!enrolled && !isOwner && (
              <div className="rounded-2xl bg-[#f3f1f8] p-4">
                <p className="text-[14px] font-bold text-navy">Join this project</p>
                <p className="mt-1 text-[13px] text-muted">Join to form your own group or request to join one.</p>
                <button onClick={enrol} disabled={pending} className="mt-3 w-full rounded-xl py-2.5 text-[13px] font-bold text-white disabled:opacity-50" style={{ background: "#7c3aed" }}>
                  {pending ? "Joining…" : "Join Project"}
                </button>
              </div>
            )}
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
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Groups open · {groups.length}{type === "academic" && numberOfGroups > 1 ? ` of ${numberOfGroups} planned` : ""}</p>
              {enrolled && allowMultipleGroups && (
                <Link href={`/project/${projectId}/new-group`} className="rounded-xl px-3 py-1.5 text-[12px] font-bold text-purple-600" style={{ background: "#ece8fc" }}>
                  + Form a group
                </Link>
              )}
            </div>
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
                    ) : !enrolled ? (
                      <button onClick={enrol} disabled={pending} className="rounded-xl px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50" style={{ background: "#7c3aed" }}>Join project first</button>
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
        {!enrolled && !isOwner ? (
          <button onClick={enrol} disabled={pending} className="w-full rounded-2xl py-3.5 text-[15px] font-bold text-white disabled:opacity-50" style={{ background: "#7c3aed" }}>
            {pending ? "Joining…" : "Join Project"}
          </button>
        ) : tab === "info" ? (
          <button onClick={() => setTab("groups")} className="w-full rounded-2xl py-3.5 text-[15px] font-bold text-white" style={{ background: "#7c3aed" }}>See groups to join</button>
        ) : enrolled && allowMultipleGroups ? (
          <Link href={`/project/${projectId}/new-group`} className="flex w-full items-center justify-center rounded-2xl py-3.5 text-[15px] font-bold text-white" style={{ background: "#7c3aed" }}>
            + Form a group
          </Link>
        ) : groups[0] ? (
          <div className="w-full"><JoinGroupButton groupId={groups[0].id} /></div>
        ) : null}
      </div>
    </div>
  );
}
