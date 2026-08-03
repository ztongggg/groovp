"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpFull } from "@/app/auth/actions";

const SKILL_OPTIONS = ["Python", "React", "TypeScript", "JavaScript", "Node.js", "SQL", "Figma", "UI/UX", "Java", "C++", "TensorFlow", "AWS", "Docker", "Research", "Product", "Design", "Business"];
const INTEREST_OPTIONS = ["Machine Learning", "EdTech", "Sustainability", "Healthcare", "FinTech", "Hackathons", "Startups", "Open Source", "Robotics", "Design", "Gaming", "Social Impact"];
const YEARS = ["Y1", "Y2", "Y3", "Y4", "Y5"];
const PERSONALITY = [
  { key: "personality", q: "Are you more introvert or extrovert?", options: ["Introvert", "Extrovert"] },
  { key: "prefer_working", q: "Prefer working online or face-to-face?", options: ["Online", "Face-to-face"] },
  { key: "best_work_time", q: "When do you do your best work?", options: ["In the morning", "At night"] },
  { key: "location", q: "Where do you stay?", options: ["On Campus", "East", "West", "North", "Central"] },
];

const STEPS = [
  { title: "Introduce yourself!", sub: "Let's start with the basics! This is how teammates will find you." },
  { title: "About you", sub: "Tell us where you study." },
  { title: "Your working style", sub: "This helps us match you with the right people." },
  { title: "Your skills", sub: "Pick what you bring to a team." },
  { title: "Your interests", sub: "What kind of projects excite you?" },
];

function Field({ icon, ...props }) {
  return (
    <div className="relative flex items-center" style={{ height: 52, borderRadius: 14, background: "#f3f1f8", paddingLeft: 48, paddingRight: 16 }}>
      <span className="absolute" style={{ left: 16 }}>{icon}</span>
      <input {...props} className="w-full bg-transparent focus:outline-none" style={{ fontSize: 14, fontWeight: 400, color: "#1d1b44" }} />
    </div>
  );
}
function Chip({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full px-4 py-2 text-[14px] font-semibold" style={{ background: active ? "#7c3aed" : "#f3f1f8", color: active ? "#fff" : "#1d1b44" }}>{children}</button>
  );
}
const I = {
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8696" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>,
  at: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8696" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1" /></svg>,
  mail: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8696" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>,
  lock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8696" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>,
  book: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8696" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" /></svg>,
};

export default function SignupPage() {
  const router = useRouter();
  const [intro, setIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [d, setD] = useState({ full_name: "", username: "", email: "", password: "", university: "SUTD", major: "", year: "", gender: "", personality: "", prefer_working: "", best_work_time: "", location: "", skills: [], interests: [] });

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const toggle = (k, v) => setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const hasSkill = (n) => d.skills.some((s) => s.name === n);
  const toggleSkill = (n) => setD((s) => ({ ...s, skills: s.skills.some((x) => x.name === n) ? s.skills.filter((x) => x.name !== n) : [...s.skills, { name: n, level: "Basic" }] }));
  const setSkillLevel = (n, level) => setD((s) => ({ ...s, skills: s.skills.map((x) => (x.name === n ? { ...x, level } : x)) }));
  const canNext = () => {
    if (step === 0) return d.full_name && d.username && d.email && d.password.length >= 6;
    if (step === 1) return d.major && d.year;
    if (step === 2) return PERSONALITY.every((p) => d[p.key]);
    if (step === 3) return d.skills.length > 0;
    return true;
  };
  async function finish() {
    setSaving(true); setError("");
    const res = await signUpFull(d);
    if (res?.error) { setSaving(false); setError(res.error); return; }
    router.push("/home"); router.refresh();
  }
  const next = () => (step < 4 ? setStep(step + 1) : finish());
  const back = () => (step > 0 ? setStep(step - 1) : setIntro(true));

  /* ---------- INTRO ---------- */
  if (intro) {
    return (
      <div className="relative w-[402px] overflow-hidden bg-white" style={{ height: 874 }}>
        <div className="absolute" style={{ left: 296, top: 112, width: 87, height: 87, borderRadius: 11, background: "#f2a5bd" }} />
        <div className="absolute rounded-full" style={{ left: 20, top: 469, width: 62, height: 62, background: "#4ac7b2" }} />
        {/* real Figma illustration (node 570:15162), exact position */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/signup-cloud.png" alt="" className="pointer-events-none absolute" style={{ left: -48, top: 88, width: 500, height: 500 }} />
        <div className="absolute" style={{ left: 32, top: 600, width: 340, fontSize: 28, fontWeight: 800, color: "#1e1b4b", lineHeight: "34px" }}>Just a few questions before you start!</div>
        <div className="absolute" style={{ left: 32, top: 700, width: 340, fontSize: 14, fontWeight: 400, color: "#6b6678", lineHeight: "17px" }}>Tell us a bit about yourself so we can match you with teammates who fit — from skills to working style.</div>
        <button onClick={() => setIntro(false)} className="absolute flex items-center justify-center" style={{ left: 32, top: 800, width: 338, height: 56, borderRadius: 28, background: "linear-gradient(90deg,#7c3aed,#6126cc)" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>I&apos;m ready!</span>
        </button>
        <Link href="/login" className="absolute" style={{ left: 24, top: 50, fontSize: 13, color: "#6b6678" }}>‹ Back</Link>
      </div>
    );
  }

  /* ---------- STEPS ---------- */
  const s = STEPS[step];
  return (
    <div className="relative w-[402px] bg-white" style={{ height: 874 }}>
      {/* back + title */}
      <button onClick={back} className="absolute flex items-center justify-center rounded-full border border-line" style={{ left: 24, top: 50, width: 40, height: 40 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1e1b4b" }}>‹</span>
      </button>
      <div className="absolute" style={{ left: 75, top: 52, fontSize: 24, fontWeight: 800, color: "#1e1b4b" }}>{s.title}</div>
      <div className="absolute" style={{ left: 25, top: 93, width: 350, fontSize: 13, fontWeight: 400, color: "#6b6678", lineHeight: "16px" }}>{s.sub}</div>

      {/* progress */}
      {[32, 102, 171, 241, 311].map((x, i) => (
        <div key={x} className="absolute" style={{ left: x, top: 140, width: i === 2 ? 62 : 61, height: 6, borderRadius: 3, background: i <= step ? "#7c3aed" : "#eae5fc" }} />
      ))}

      {/* content */}
      <div className="absolute" style={{ left: 33, top: 172, width: 337, bottom: 128, overflowY: "auto" }}>
        {step === 0 && (
          <>
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center rounded-full" style={{ width: 76, height: 76, background: "#f5f0ff" }}>
                {I.user}
                <span className="absolute flex items-center justify-center rounded-full" style={{ right: -4, bottom: -2, width: 32, height: 32, background: "#7c3aed" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" /><circle cx="12" cy="13" r="4" /></svg>
                </span>
              </div>
              <p className="mt-2 text-[12.5px] font-semibold text-purple-600">Add a profile photo</p>
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              <Field icon={I.user} placeholder="Full name" value={d.full_name} onChange={(e) => set("full_name", e.target.value)} />
              <Field icon={I.at} placeholder="Username" value={d.username} onChange={(e) => set("username", e.target.value)} />
              <Field icon={I.mail} type="email" placeholder="Email" value={d.email} onChange={(e) => set("email", e.target.value)} />
              <Field icon={I.lock} type="password" placeholder="Password (min 6)" value={d.password} onChange={(e) => set("password", e.target.value)} />
            </div>
          </>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-2.5">
            <Field icon={I.book} placeholder="University" value={d.university} onChange={(e) => set("university", e.target.value)} />
            <Field icon={I.book} placeholder="Major (e.g. Computer Science)" value={d.major} onChange={(e) => set("major", e.target.value)} />
            <p className="mt-2 text-[13px] font-bold uppercase tracking-wide text-muted">Year of study</p>
            <div className="flex flex-wrap gap-2">{YEARS.map((y) => <Chip key={y} active={d.year === y} onClick={() => set("year", y)}>{y}</Chip>)}</div>
            <p className="mt-2 text-[13px] font-bold uppercase tracking-wide text-muted">How do you identify?</p>
            <div className="flex flex-wrap gap-2">{["Woman", "Man", "Non-binary", "Prefer not to say"].map((g) => <Chip key={g} active={d.gender === g} onClick={() => set("gender", g)}>{g}</Chip>)}</div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            {PERSONALITY.map((p) => (
              <div key={p.key}>
                <p className="mb-2 text-[15px] font-semibold text-navy">{p.q}</p>
                <div className="flex flex-wrap gap-2">{p.options.map((o) => <Chip key={o} active={d[p.key] === o} onClick={() => set(p.key, o)}>{o}</Chip>)}</div>
              </div>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2.5">
              {SKILL_OPTIONS.map((x) => <Chip key={x} active={hasSkill(x)} onClick={() => toggleSkill(x)}>{x}</Chip>)}
            </div>
            {d.skills.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-bold uppercase tracking-wide text-muted">Set your level</p>
                {d.skills.map((s) => (
                  <div key={s.name} className="flex items-center justify-between rounded-xl bg-[#f3f1f8] px-3 py-2">
                    <span className="text-[14px] font-semibold text-navy">{s.name}</span>
                    <div className="flex gap-1">
                      {["Basic", "Pro", "Expert"].map((lv) => (
                        <button key={lv} type="button" onClick={() => setSkillLevel(s.name, lv)} className="rounded-md px-2.5 py-1 text-[11px] font-bold" style={{ background: s.level === lv ? "#7c3aed" : "#fff", color: s.level === lv ? "#fff" : "#757080" }}>{lv}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {step === 4 && <div className="flex flex-wrap gap-2.5">{INTEREST_OPTIONS.map((x) => <Chip key={x} active={d.interests.includes(x)} onClick={() => toggle("interests", x)}>{x}</Chip>)}</div>}
        {error && <p className="mt-4 text-[14px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
      </div>

      {/* bottom buttons */}
      <button onClick={back} className="absolute flex items-center justify-center" style={{ left: 32, top: 762, width: 101, height: 51, borderRadius: 18, background: "#f3f1f8" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#1d1b44" }}>Cancel</span>
      </button>
      <button onClick={next} disabled={!canNext() || saving} className="absolute flex items-center justify-center disabled:opacity-50" style={{ left: 143, top: 762, width: 226, height: 51, borderRadius: 18, background: "#7c3aed" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{saving ? "Creating…" : step < 4 ? "Next →" : "Finish"}</span>
      </button>
    </div>
  );
}
