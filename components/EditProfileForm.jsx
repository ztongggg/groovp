"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/edit-profile/actions";
import AvatarUpload from "@/components/AvatarUpload";

const YEARS = ["Y1", "Y2", "Y3", "Y4", "Y5"];
const SKILL_OPTIONS = ["Python", "React", "TypeScript", "JavaScript", "Node.js", "SQL", "Figma", "UI/UX", "Java", "C++", "TensorFlow", "AWS", "Docker", "Research", "Product", "Design", "Business"];
const INTEREST_OPTIONS = [
  { name: "Sustainability", icon: "/interest-sustainability.svg" },
  { name: "EdTech", icon: "/interest-edtech.svg" },
  { name: "Web Dev", icon: "/interest-webdev.svg" },
  { name: "Healthcare", icon: "/interest-healthcare.svg" },
  { name: "Data Science", icon: "/interest-datascience.svg" },
  { name: "Social Impact", icon: "/interest-socialimpact.svg" },
  { name: "Robotics", icon: "/interest-robotics.svg" },
  { name: "AI & ML", icon: "/interest-aiml.svg" },
  { name: "Design", icon: "/interest-design.svg" },
];
const PERSONALITY = [
  { key: "personality", label: "Personality", options: ["Introvert", "Extrovert"] },
  { key: "prefer_working", label: "Prefer Working", options: ["Online", "Face-to-face"] },
  { key: "best_work_time", label: "Best Work Time", options: ["In the morning", "At night"] },
];
const LOCATIONS = ["North", "South", "East", "West", "On Campus", "Central"];
const STEPS = ["Edit Profile", "Edit Skills", "Edit Interests", "Projects & Links"];

const cls = "rounded-2xl bg-[#f3f1f8] px-4 py-3.5 text-[15px] text-navy focus:outline-none w-full";
const PROJECT_TINTS = ["#4AC7B2", "#B1B4ED", "#C4B5FD", "#F2A5BD"];
// Behance and the generic "+ Add another link" row in the Figma frame have no
// backing column, so they are deliberately not rendered — an inert field here
// would look saved and never be.
const LINK_FIELDS = [
  { key: "linkedin_url", label: "LinkedIn", glyph: "in", bg: "#086BAD", placeholder: "linkedin.com/in/username" },
  { key: "github_url", label: "GitHub", glyph: "GH", bg: "#141414", placeholder: "github.com/username" },
  { key: "portfolio_url", label: "Portfolio Website", glyph: "🌐", bg: "#7C3AED", placeholder: "yourname.dev" },
];
function Chip({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className="rounded-full px-4 py-2 text-[13px] font-semibold" style={{ background: active ? "#fff" : "#f3f1f8", color: active ? "#7c3aed" : "#1d1b44", border: active ? "1px solid #7c3aed" : "1px solid transparent" }}>{children}</button>;
}

export default function EditProfileForm({ initial, initialStep = 0, pastProjects = [] }) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [d, setD] = useState({
    full_name: initial.full_name || "",
    username: initial.username || "",
    avatar_url: initial.avatar_url || "",
    bio: initial.bio || "",
    major: initial.major || "",
    year: initial.year || "",
    personality: initial.personality || "",
    prefer_working: initial.prefer_working || "",
    best_work_time: initial.best_work_time || "",
    location: initial.location || "",
    skills: initial.skills || [], // [{ name, level }]
    interests: initial.interests || [],
    linkedin_url: initial.linkedin_url || "",
    github_url: initial.github_url || "",
    portfolio_url: initial.portfolio_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));

  const hasSkill = (n) => d.skills.some((x) => x.name === n);
  const toggleSkill = (n) => setD((s) => ({ ...s, skills: hasSkill(n) ? s.skills.filter((x) => x.name !== n) : [...s.skills, { name: n, level: "Basic" }] }));
  const setSkillLevel = (n, level) => setD((s) => ({ ...s, skills: s.skills.map((x) => (x.name === n ? { ...x, level } : x)) }));
  const toggleInterest = (n) => setD((s) => ({ ...s, interests: s.interests.includes(n) ? s.interests.filter((x) => x !== n) : [...s.interests, n] }));

  async function save() {
    setSaving(true); setError("");
    const res = await updateProfile(d);
    if (res?.error) { setError(res.error); setSaving(false); }
    else { router.push("/profile"); router.refresh(); }
  }
  const back = () => (step > 0 ? setStep(step - 1) : router.push("/profile"));
  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));

  return (
    <div className="flex flex-col gap-3 px-6 pb-10">
      <button type="button" onClick={back} className="mb-1 self-start" style={{ fontSize: 13, fontWeight: 700, color: "#6b6678" }}>‹ Back</button>
      <h1 className="text-[22px] font-extrabold text-navy">{STEPS[step]}</h1>
      <p className="-mt-1 text-[13px] text-muted">
        {step === 0 && "Update how teammates see you."}
        {step === 1 && "Update your skills!"}
        {step === 2 && "Update your interests!"}
        {step === 3 && "Show teammates your work outside Groovp."}
      </p>

      {step === 0 && (
        <>
          <div className="my-2 flex justify-center">
            <AvatarUpload url={d.avatar_url} onChange={(u) => set("avatar_url", u)} size={96} round />
          </div>
          <input className={cls} placeholder="Full name" value={d.full_name} onChange={(e) => set("full_name", e.target.value)} />
          <input className={cls} placeholder="Username" value={d.username} onChange={(e) => set("username", e.target.value)} />
          <textarea className={cls} rows={3} placeholder="Short bio — what are you into?" value={d.bio} onChange={(e) => set("bio", e.target.value)} />
          <div className={`${cls} flex items-center justify-between`}>
            <span>{initial.university || "University"}</span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-muted">Verified</span>
          </div>
          <input className={cls} placeholder="Major" value={d.major} onChange={(e) => set("major", e.target.value)} />

          <p className="mt-2 text-[14px] font-bold text-navy">Year of study</p>
          <div className="flex flex-wrap gap-2">{YEARS.map((y) => <Chip key={y} active={d.year === y} onClick={() => set("year", y)}>{y}</Chip>)}</div>

          <p className="mt-3 text-[16px] font-extrabold text-navy">Working Style</p>
          <p className="-mt-2 text-[12px] text-muted">For each, pick how you work.</p>
          {PERSONALITY.map((p) => (
            <div key={p.key} className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-navy">{p.label}</span>
              <div className="flex gap-2">{p.options.map((o) => <Chip key={o} active={d[p.key] === o} onClick={() => set(p.key, o)}>{o}</Chip>)}</div>
            </div>
          ))}

          <p className="mt-3 text-[16px] font-extrabold text-navy">Place of Stay</p>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((loc) => (
              <Chip key={loc} active={d.location === loc} onClick={() => set("location", loc)}>{loc === "On Campus" ? "Campus" : loc}</Chip>
            ))}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div className={`${cls} flex items-center gap-2.5`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
            <span className="text-[14px] text-muted">Find more of your skills</span>
          </div>
          <div className="flex flex-wrap gap-2">{SKILL_OPTIONS.map((x) => <Chip key={x} active={hasSkill(x)} onClick={() => toggleSkill(x)}>{x}</Chip>)}</div>
          {d.skills.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-[15px] font-bold text-navy">Set your skill level</p>
              <p className="-mt-1.5 text-[11.5px] text-muted">For each skill, pick how confident you are.</p>
              {d.skills.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-xl bg-[#f7f6fa] px-3 py-2">
                  <span className="text-[13px] font-semibold text-navy">{s.name}</span>
                  <div className="flex gap-1.5">
                    {["Basic", "Good", "Expert"].map((lv) => (
                      <button key={lv} type="button" onClick={() => setSkillLevel(s.name, lv)} className="rounded-md px-2.5 py-1 text-[11px] font-bold" style={{ background: s.level === lv ? "#fff" : "transparent", color: s.level === lv ? "#7c3aed" : "#757080", border: s.level === lv ? "1px solid #7c3aed" : "1px solid transparent" }}>{lv}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <div className="grid grid-cols-3 gap-x-2 gap-y-6 py-2">
          {INTEREST_OPTIONS.map(({ name, icon }) => {
            const active = d.interests.includes(name);
            return (
              <button key={name} type="button" onClick={() => toggleInterest(name)} className="flex flex-col items-center gap-2">
                <span className="flex items-center justify-center rounded-full" style={{ width: 72, height: 72, background: active ? "#7c3aed" : "#f3f1f8" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={icon} alt="" width={28} height={28} style={{ filter: active ? "brightness(0) invert(1)" : "none" }} />
                </span>
                <span className="text-center" style={{ fontSize: 11.5, fontWeight: active ? 600 : 400, color: active ? "#1d1b44" : "#757080" }}>{name}</span>
              </button>
            );
          })}
        </div>
      )}

      {step === 3 && (
        <>
          <p style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: "#757080" }}>Projects</p>
          {pastProjects.map((pp, i) => (
            <Link key={pp.id} href={`/past-projects/${pp.id}`} style={{ height: 72, background: "#fff", borderRadius: 16, border: "1px solid #F3F1F8", boxShadow: "0px 2px 10px rgba(25,20,51,0.05)", display: "flex", alignItems: "center", gap: 10, padding: 10 }}>
              <span style={{ position: "relative", width: 52, height: 52, borderRadius: 12, background: PROJECT_TINTS[i % PROJECT_TINTS.length], flexShrink: 0, display: "block" }}>
                <span style={{ position: "absolute", left: 16.5, top: 23.5, width: 5, height: 5, borderRadius: 9999, background: "#fff" }} />
                <span style={{ position: "absolute", left: 30.5, top: 23.5, width: 5, height: 5, borderRadius: 9999, background: "#fff" }} />
                <span style={{ position: "absolute", left: 22.3, top: 31.5, width: 7.5, height: 2.5, borderRadius: 1.3, background: "#fff" }} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "#1D1B44", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pp.name}</span>
                <span style={{ display: "block", fontSize: 11, color: "#757080", marginTop: 4 }}>{pp.subtitle}</span>
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6126CC", flexShrink: 0 }}>View ›</span>
            </Link>
          ))}
          <Link href="/past-projects/add" style={{ height: 48, borderRadius: 14, background: "#fff", border: "1.5px solid #7C3AED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#7C3AED" }}>+ Add Project</Link>

          <p style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "#757080" }}>Links</p>
          {LINK_FIELDS.map((f) => (
            <div key={f.key} style={{ height: 64, background: "#fff", borderRadius: 16, border: "1px solid #F3F1F8", display: "flex", alignItems: "center", gap: 12, padding: "0 14px" }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: f.bg, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.glyph}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#757080" }}>{f.label}</p>
                <input
                  className="w-full bg-transparent focus:outline-none"
                  style={{ fontSize: 13, color: "#1D1B44" }}
                  placeholder={f.placeholder}
                  value={d[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </>
      )}

      {error && <p className="mt-3 text-[14px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}

      <div className="mt-4 flex gap-3">
        <button onClick={save} disabled={saving} className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[15px] font-bold text-white disabled:opacity-50">
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {step < STEPS.length - 1 && (
          <button onClick={next} className="flex-1 rounded-2xl py-4 text-[15px] font-bold text-navy" style={{ background: "#f3f1f8" }}>Next</button>
        )}
      </div>
    </div>
  );
}
