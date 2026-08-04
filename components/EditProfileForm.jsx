"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/edit-profile/actions";

const YEARS = ["Y1", "Y2", "Y3", "Y4", "Y5"];
const SKILL_OPTIONS = ["Python", "React", "TypeScript", "JavaScript", "Node.js", "SQL", "Figma", "UI/UX", "Java", "C++", "TensorFlow", "AWS", "Docker", "Research", "Product", "Design", "Business"];
const INTEREST_OPTIONS = ["Machine Learning", "EdTech", "Sustainability", "Healthcare", "FinTech", "Hackathons", "Startups", "Open Source", "Robotics", "Design", "Gaming", "Social Impact"];
const PERSONALITY = [
  { key: "personality", q: "Introvert or extrovert?", options: ["Introvert", "Extrovert"] },
  { key: "prefer_working", q: "Online or face-to-face?", options: ["Online", "Face-to-face"] },
  { key: "best_work_time", q: "Best work time", options: ["In the morning", "At night"] },
  { key: "location", q: "Where do you stay?", options: ["On Campus", "East", "West", "North", "Central"] },
];
const cls = "rounded-2xl border border-line bg-bgapp px-4 py-3.5 text-[15px] text-navy focus:border-purple-600 focus:outline-none";

function Chip({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className="rounded-full px-4 py-2 text-[14px] font-semibold" style={{ background: active ? "#7c3aed" : "#f3f1f8", color: active ? "#fff" : "#1d1b44" }}>{children}</button>;
}

export default function EditProfileForm({ initial }) {
  const router = useRouter();
  const [d, setD] = useState({
    full_name: initial.full_name || "",
    username: initial.username || "",
    university: initial.university || "SUTD",
    major: initial.major || "",
    year: initial.year || "",
    personality: initial.personality || "",
    prefer_working: initial.prefer_working || "",
    best_work_time: initial.best_work_time || "",
    location: initial.location || "",
    skills: initial.skills || [], // [{ name, level }]
    interests: initial.interests || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
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

  return (
    <div className="flex flex-col gap-3 px-6 pb-10">
      <input className={cls} placeholder="Full name" value={d.full_name} onChange={(e) => set("full_name", e.target.value)} />
      <input className={cls} placeholder="Username" value={d.username} onChange={(e) => set("username", e.target.value)} />
      <input className={cls} placeholder="University" value={d.university} onChange={(e) => set("university", e.target.value)} />
      <input className={cls} placeholder="Major" value={d.major} onChange={(e) => set("major", e.target.value)} />

      <p className="mt-2 text-[13px] font-bold uppercase tracking-wide text-muted">Year of study</p>
      <div className="flex flex-wrap gap-2">{YEARS.map((y) => <Chip key={y} active={d.year === y} onClick={() => set("year", y)}>{y}</Chip>)}</div>

      {!showQuiz ? (
        <button type="button" onClick={() => setShowQuiz(true)} className="mt-3 text-left text-[14px] font-bold text-purple-600">Retake personality quiz ›</button>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {PERSONALITY.map((p) => (
            <div key={p.key}>
              <p className="mb-2 text-[14px] font-semibold text-navy">{p.q}</p>
              <div className="flex flex-wrap gap-2">{p.options.map((o) => <Chip key={o} active={d[p.key] === o} onClick={() => set(p.key, o)}>{o}</Chip>)}</div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-[13px] font-bold uppercase tracking-wide text-muted">Skills</p>
      <div className="flex flex-wrap gap-2">{SKILL_OPTIONS.map((x) => <Chip key={x} active={hasSkill(x)} onClick={() => toggleSkill(x)}>{x}</Chip>)}</div>
      {d.skills.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {d.skills.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-xl bg-[#f7f6fa] px-3 py-2">
              <span className="text-[13px] font-semibold text-navy">{s.name}</span>
              <div className="flex gap-1.5">
                {["Basic", "Pro", "Expert"].map((lv) => (
                  <button key={lv} type="button" onClick={() => setSkillLevel(s.name, lv)} className="rounded-md px-2.5 py-1 text-[11px] font-bold" style={{ background: s.level === lv ? "#7c3aed" : "#fff", color: s.level === lv ? "#fff" : "#757080" }}>{lv}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-[13px] font-bold uppercase tracking-wide text-muted">Interests</p>
      <div className="flex flex-wrap gap-2">{INTEREST_OPTIONS.map((x) => <Chip key={x} active={d.interests.includes(x)} onClick={() => toggleInterest(x)}>{x}</Chip>)}</div>

      {error && <p className="mt-3 text-[14px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}

      <button onClick={save} disabled={saving} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[16px] font-bold text-white disabled:opacity-50">
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
