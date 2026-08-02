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

const inputCls = "rounded-2xl border border-line bg-bgapp px-4 py-3.5 text-[15px] text-navy focus:border-purple-600 focus:outline-none";

function ProgressBar({ step, total }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= step ? "#7c3aed" : "#ece8fc" }} />
      ))}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="rounded-full px-4 py-2 text-[14px] font-semibold" style={{ background: active ? "#7c3aed" : "#f3f1f8", color: active ? "#fff" : "#1d1b44" }}>
      {children}
    </button>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [d, setD] = useState({
    full_name: "", username: "", email: "", password: "",
    university: "SUTD", major: "", year: "",
    personality: "", prefer_working: "", best_work_time: "", location: "",
    skills: [], interests: [],
  });

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const toggle = (k, v) => setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  const canNext = () => {
    if (step === 0) return d.full_name && d.username && d.email && d.password.length >= 6;
    if (step === 1) return d.major && d.year;
    if (step === 2) return PERSONALITY.every((p) => d[p.key]);
    if (step === 3) return d.skills.length > 0;
    return true;
  };

  async function finish() {
    setSaving(true);
    setError("");
    const res = await signUpFull(d);
    if (res?.error) {
      setSaving(false);
      setError(res.error);
      return;
    }
    router.push("/home");
    router.refresh();
  }

  const next = () => (step < 4 ? setStep(step + 1) : finish());

  return (
    <div className="flex min-h-full flex-col bg-white px-6 pb-10 pt-14">
      <div className="mb-6 flex items-center gap-4">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-[20px] text-navy">‹</button>
        ) : (
          <Link href="/login" className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-[20px] text-navy">‹</Link>
        )}
        <div className="flex-1"><ProgressBar step={step} total={5} /></div>
      </div>

      {step === 0 && (
        <>
          <h1 className="text-[26px] font-extrabold text-navy">Introduce yourself</h1>
          <p className="mt-1 text-[15px] text-muted">The basics to get you started.</p>
          <div className="mt-6 flex flex-col gap-3">
            <input className={inputCls} placeholder="Full name" value={d.full_name} onChange={(e) => set("full_name", e.target.value)} />
            <input className={inputCls} placeholder="Username" value={d.username} onChange={(e) => set("username", e.target.value)} />
            <input className={inputCls} type="email" placeholder="Email" value={d.email} onChange={(e) => set("email", e.target.value)} />
            <input className={inputCls} type="password" placeholder="Password (min 6 chars)" value={d.password} onChange={(e) => set("password", e.target.value)} />
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="text-[26px] font-extrabold text-navy">About you</h1>
          <p className="mt-1 text-[15px] text-muted">Tell us where you study.</p>
          <div className="mt-6 flex flex-col gap-3">
            <input className={inputCls} placeholder="University" value={d.university} onChange={(e) => set("university", e.target.value)} />
            <input className={inputCls} placeholder="Major (e.g. Computer Science)" value={d.major} onChange={(e) => set("major", e.target.value)} />
            <p className="mt-2 text-[13px] font-bold uppercase tracking-wide text-muted">Year of study</p>
            <div className="flex flex-wrap gap-2">
              {YEARS.map((y) => <Chip key={y} active={d.year === y} onClick={() => set("year", y)}>{y}</Chip>)}
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-[26px] font-extrabold text-navy">Your working style</h1>
          <p className="mt-1 text-[15px] text-muted">Helps us match you well.</p>
          <div className="mt-6 flex flex-col gap-5">
            {PERSONALITY.map((p) => (
              <div key={p.key}>
                <p className="mb-2 text-[15px] font-semibold text-navy">{p.q}</p>
                <div className="flex flex-wrap gap-2">
                  {p.options.map((o) => <Chip key={o} active={d[p.key] === o} onClick={() => set(p.key, o)}>{o}</Chip>)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="text-[26px] font-extrabold text-navy">Your skills</h1>
          <p className="mt-1 text-[15px] text-muted">Pick what you bring to a team.</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {SKILL_OPTIONS.map((s) => <Chip key={s} active={d.skills.includes(s)} onClick={() => toggle("skills", s)}>{s}</Chip>)}
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h1 className="text-[26px] font-extrabold text-navy">Your interests</h1>
          <p className="mt-1 text-[15px] text-muted">What kind of projects excite you?</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {INTEREST_OPTIONS.map((s) => <Chip key={s} active={d.interests.includes(s)} onClick={() => toggle("interests", s)}>{s}</Chip>)}
          </div>
        </>
      )}

      {error && <p className="mt-4 text-[14px] font-medium text-badge-declinedText">{error}</p>}

      <div className="mt-auto pt-8">
        <button
          onClick={next}
          disabled={!canNext() || saving}
          className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[16px] font-bold text-white disabled:opacity-50"
        >
          {saving ? "Creating…" : step < 4 ? "Continue" : "Finish"}
        </button>
        {step === 0 && (
          <p className="mt-4 text-center text-[15px] text-muted">
            Already have an account? <Link href="/login" className="font-bold text-purple-600">Log in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
