"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";

const PersonIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>);
const ChatIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 0 1-11.5 7.2L4 20l.8-4.5A8 8 0 1 1 20 12Z" /></svg>);
const ClockIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const PinIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>);
const StarIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="#1d1b44"><path d="m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.3l6-.7L12 3Z" /></svg>);

function StatCard({ icon, tint, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f4f2f8] p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: tint }}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
        <p className="text-[16px] font-bold text-navy">{value || "—"}</p>
      </div>
    </div>
  );
}

function TagCard({ label, tags }) {
  return (
    <div className="rounded-2xl border border-[#ede9fe] bg-white p-5">
      <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-muted">{label}</p>
      {tags.length === 0 ? (
        <p className="text-[14px] text-muted">Nothing added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {tags.map((t) => <span key={t} className="rounded-full bg-[#f0eef5] px-4 py-2 text-[14px] font-semibold text-navy">{t}</span>)}
        </div>
      )}
    </div>
  );
}

function SkillsCard({ skills }) {
  return (
    <div className="rounded-2xl border border-[#ede9fe] bg-white p-5">
      <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-muted">Skills</p>
      {skills.length === 0 ? (
        <p className="text-[14px] text-muted">Nothing added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {skills.map((s) => (
            <span key={s.name} className="inline-flex items-center gap-1.5 rounded-full bg-[#f0eef5] py-2 pl-4 pr-2 text-[14px] font-semibold text-navy">
              {s.name}
              {s.level && <span className="rounded-full bg-[#e2dfea] px-2 py-0.5 text-[11px] font-bold text-[#6b6678]">{s.level}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function LinkRow({ icon, iconBg, label, url, verified }) {
  if (!url) return null;
  const display = url.replace(/^https?:\/\//, "");
  return (
    <a href={url.startsWith("http") ? url : `https://${url}`} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-[#ede9fe] bg-white p-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: iconBg }}>{icon}</span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-navy">{label}</p>
          <p className="truncate text-[12.5px] text-purple-600" style={{ maxWidth: 200 }}>{display}</p>
        </div>
      </div>
      {verified && <span className="shrink-0 text-[11px] font-bold text-[#298c52]">✓ Verified</span>}
    </a>
  );
}

export default function ProfileView({ userId, name, username, subtitle, ratingLabel, ratingCount, personality = {}, skills = [], interests = [], pastProjects = [], linkedinVerified = false, githubVerified = false, linkedinUrl = "", githubUrl = "", portfolioUrl = "" }) {
  const [tab, setTab] = useState("about");

  return (
    <div className="min-h-full w-[402px] bg-white pb-8">
      {/* Banner */}
      <div className="relative h-36" style={{ background: "linear-gradient(135deg,#2d1a6b,#5929bf)" }}>
        <Link href="/settings" aria-label="Settings" className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[18px]">⚙</Link>
      </div>

      <div className="px-5">
        {/* avatar + name */}
        <div className="-mt-14 flex items-end gap-4">
          <div className="relative h-28 w-28 shrink-0 rounded-full border-4 border-white" style={{ background: "#f29c38" }}>
            <span className="absolute rounded-full bg-white" style={{ left: "34%", top: "44%", width: 10, height: 10 }} />
            <span className="absolute rounded-full bg-white" style={{ right: "34%", top: "44%", width: 10, height: 10 }} />
            <span className="absolute rounded-full bg-white" style={{ bottom: "30%", left: "50%", transform: "translateX(-50%)", width: 28, height: 8 }} />
          </div>
          <div className="pb-2">
            <h1 className="text-[26px] font-extrabold leading-tight text-navy">{name}</h1>
            <p className="text-[15px] text-muted">@{username}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[15px] text-muted">{subtitle}</p>
          <Link href="/edit-profile" className="shrink-0 rounded-full px-4 py-2 text-[12.5px] font-bold text-purple-600" style={{ background: "#f0eef5" }}>Edit Profile</Link>
        </div>
        <Link href={`/ratings/${userId}`} className="mt-1 flex items-center gap-2">
          <StarIcon />
          <span className="text-[20px] font-extrabold text-navy">{ratingLabel}</span>
          <span className="text-[14px] text-muted">({ratingCount} Ratings)</span>
          {ratingCount > 0 && <span className="text-[13px] font-bold text-purple-600">See all ›</span>}
        </Link>

        {/* tabs */}
        <div className="mt-5 flex rounded-2xl bg-[#eeebf3] p-1.5">
          {[["about", "About"], ["project", "Project"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex-1 rounded-xl py-3 text-[16px] font-bold ${tab === k ? "bg-white text-navy shadow-card" : "text-muted"}`}>{l}</button>
          ))}
        </div>

        {tab === "about" ? (
          <div className="mt-6 flex flex-col gap-5">
            <div>
              <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-muted">About me</p>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<PersonIcon />} tint="#dcebff" label="Personality" value={personality.personality} />
                <StatCard icon={<ChatIcon />} tint="#d8f0de" label="Prefer working" value={personality.prefer_working} />
                <StatCard icon={<ClockIcon />} tint="#e9e3fb" label="Best work time" value={personality.best_work_time} />
                <StatCard icon={<PinIcon />} tint="#fbebcf" label="Location" value={personality.location} />
              </div>
            </div>

            {(linkedinUrl || githubUrl || portfolioUrl) && (
              <div className="flex flex-col gap-2.5">
                <LinkRow icon="in" iconBg="#0a66c2" label="LinkedIn" url={linkedinUrl} verified={linkedinVerified} />
                <LinkRow icon="◘" iconBg="#1f2328" label="GitHub" url={githubUrl} verified={githubVerified} />
                <LinkRow icon="🌐" iconBg="#7c3aed" label="Portfolio Website" url={portfolioUrl} />
              </div>
            )}

            <SkillsCard skills={skills} />
            <TagCard label="Interests" tags={interests} />

            <form action={signOut}>
              <button type="submit" className="w-full rounded-2xl py-3.5 text-[15px] font-bold" style={{ background: "#fae0e0", color: "#bf4247" }}>Log Out</button>
            </form>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3 pb-6">
            <Link href="/past-projects/add" className="rounded-2xl border-2 border-dashed border-line py-4 text-center text-[15px] font-bold text-purple-600">+ Add a past project</Link>
            {pastProjects.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-muted">No past projects yet.</p>
            ) : (
              pastProjects.map((pp) => (
                <Link key={pp.id} href={`/past-projects/${pp.id}`} className="flex items-center justify-between rounded-2xl border border-line bg-white p-4">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-navy">{pp.role || "Untitled project"}</p>
                    {pp.write_up && <p className="mt-1 truncate text-[13px] text-muted">{pp.write_up}</p>}
                  </div>
                  <span className="shrink-0 text-[16px] text-muted">›</span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
