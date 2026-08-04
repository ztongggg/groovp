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

export default function ProfileView({ name, username, subtitle, ratingLabel, ratingCount, personality = {}, skills = [], interests = [], pastProjects = [], linkedinVerified = false, githubVerified = false }) {
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
            <h1 className="flex items-center gap-1.5 text-[26px] font-extrabold leading-tight text-navy">
              {name}
              {linkedinVerified && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0a66c2" aria-label="LinkedIn verified"><title>LinkedIn verified</title><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" /></svg>
              )}
              {githubVerified && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1f2328" aria-label="GitHub verified"><title>GitHub verified</title><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.4-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.28 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" /></svg>
              )}
            </h1>
            <p className="text-[15px] text-muted">@{username}</p>
          </div>
        </div>

        <p className="mt-3 text-[15px] text-muted">{subtitle}</p>
        <div className="mt-1 flex items-center gap-2">
          <StarIcon />
          <span className="text-[20px] font-extrabold text-navy">{ratingLabel}</span>
          <span className="text-[14px] text-muted">({ratingCount} Ratings)</span>
        </div>

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
                <div key={pp.id} className="rounded-2xl border border-line bg-white p-4">
                  <p className="text-[15px] font-bold text-navy">{pp.role}</p>
                  {pp.write_up && <p className="mt-1 text-[13px] text-muted">{pp.write_up}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
