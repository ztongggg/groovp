"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import JoinGroupButton from "@/components/JoinGroupButton";
import FavoriteButton from "@/components/FavoriteButton";
import MemberBlobs from "@/components/MemberBlobs";
import DiscoverCard from "@/components/DiscoverCard";
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

function fileLabel(url) {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").pop() || url);
  } catch {
    return url;
  }
}

export default function ProjectDetailView({ name, description, type, ownerUsername, dateRange, skills = [], memberCount, memberTotal = 0, maxSize, groups = [], meId, projectId, favorited, joinCode, enrolled, isOwner, allowMultipleGroups, coverImageUrl, numberOfGroups, projectLink, resourceFiles = [], thingsToNote, similar = [] }) {
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
      {/* full-bleed cover banner — navy with the design's decorative discs behind
          the cover image, so a project with no cover still looks intentional */}
      <div className="relative overflow-hidden" style={{ height: 260, background: "#1e1b4b" }}>
        <div className="absolute rounded-full" style={{ left: -60, top: 90, width: 200, height: 200, background: "rgba(244,114,182,0.90)" }} />
        <div className="absolute rounded-full" style={{ left: 275, top: 155, width: 150, height: 150, background: "rgba(220,246,116,0.95)" }} />
        <div className="absolute rounded-full" style={{ left: 65, top: -45, width: 130, height: 130, background: "rgba(167,139,250,0.85)" }} />
        <div className="absolute rounded-full" style={{ left: 155, top: 155, width: 90, height: 90, background: "rgba(245,240,255,0.15)" }} />
        {coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <Link href="/discover" aria-label="Back" className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 24, top: 59, width: 31, height: 31 }}>
          <svg width="7" height="12" viewBox="0 0 8 14" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1 1 7l6 6" /></svg>
        </Link>
        {isOwner && (
          <Link href={`/project/${projectId}/edit`} className="absolute flex items-center justify-center" style={{ left: 302, top: 16, width: 76, height: 32, borderRadius: 16, background: "rgba(255,255,255,0.92)", fontSize: 11.5, color: "#1d1b44", fontFamily: "Inter, sans-serif" }}>✎ Edit</Link>
        )}
        <div className="absolute" style={{ right: 20, top: 56 }}>
          <FavoriteButton projectId={projectId} initial={favorited} />
        </div>
        <span
          className="absolute flex items-center justify-center"
          style={{ left: 17, top: 187, height: 26, padding: "0 16px", borderRadius: 13, background: "rgba(255,255,255,0.92)", fontSize: 10.5, fontWeight: 600, color: "#6126cc", fontFamily: "Inter, sans-serif" }}
        >
          {type === "personal" ? "Personal" : "Academic"}
        </span>
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
          <div className="flex items-center gap-2">
            <MemberBlobs count={memberTotal} size={25} />
            <p className="text-[13px] text-muted">by @{ownerUsername}</p>
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#434343" }}>{memberCount} members</p>
        </div>
        {dateRange.trim() !== "-" && <p className="mt-3" style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>{dateRange}</p>}

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

            {/* Resources — the project link and any uploaded files. Both were
                already stored and editable, but never shown on this screen. */}
            {(projectLink || resourceFiles.length > 0) && (
              <div className="flex flex-col gap-1.5">
                <p style={{ fontSize: 10, fontWeight: 800, color: "#9ca3af" }}>Resources</p>
                {projectLink && (
                  <a href={projectLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 truncate" style={{ background: "#f9f7ff", borderRadius: 12, padding: "10px 12px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
                    <span className="truncate" style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>{projectLink}</span>
                  </a>
                )}
                {resourceFiles.map((f) => (
                  <a key={f} href={f} target="_blank" rel="noreferrer" className="flex items-center gap-2 truncate" style={{ background: "#f9f7ff", borderRadius: 11, padding: "8px 12px" }}>
                    <span style={{ fontSize: 14 }}>📄</span>
                    <span className="truncate" style={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>{fileLabel(f)}</span>
                  </a>
                ))}
              </div>
            )}

            {thingsToNote && (
              <div style={{ background: "#f9f7ff", borderRadius: 12, padding: 12 }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: "#1d1b44" }}>Things to note</p>
                <p className="mt-1" style={{ fontSize: 12, fontWeight: 600, color: "#4b5563", lineHeight: "18px" }}>{thingsToNote}</p>
              </div>
            )}
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
                <div
                  key={g.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/groups/${g.id}`)}
                  onKeyDown={(e) => { if (e.key === "Enter") router.push(`/groups/${g.id}`); }}
                  className="cursor-pointer rounded-2xl border border-line bg-white p-4 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-bold text-navy">{g.name}</p>
                    <span className="text-[13px] font-semibold text-muted">{members.length}/{maxSize} members</span>
                  </div>
                  <p className="mt-1 text-[12px] font-semibold" style={{ color: g.recruiting ? "#298c52" : "#9ca3af" }}>
                    {g.recruiting ? (g.membersWanted > 0 ? `Open — looking for ${g.membersWanted} more` : "Open to requests") : "Not recruiting"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-2" onClick={(e) => e.stopPropagation()}>
                      {members.slice(0, 5).map((m, i) => (
                        <Link key={m.user_id} href={`/u/${m.user_id}`} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white" style={{ background: AVATAR[i % AVATAR.length] }}>
                          {(m.name || "?").slice(0, 2).toUpperCase()}
                        </Link>
                      ))}
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
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
                </div>
              );
            })}
          </div>
        )}
        {/* More projects like this — ranked by shared skills/interests */}
        {tab === "info" && similar.length > 0 && (
          <div className="mt-8">
            <div className="flex items-baseline justify-between" style={{ paddingRight: 6 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#1e1b4b" }}>More projects like this</p>
              <Link href="/discover" style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>View All</Link>
            </div>
            <div className="mt-4 flex flex-col gap-5">
              {similar.map((s) => (
                <DiscoverCard
                  key={s.id}
                  title={s.title}
                  desc={s.desc}
                  skills={s.skills}
                  count={s.count}
                  date={s.date}
                  memberCount={s.memberCount}
                  groupId={s.groupId}
                  projectId={s.id}
                  coverImageUrl={s.coverImageUrl}
                />
              ))}
            </div>
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
