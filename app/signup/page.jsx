"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpFull } from "@/app/auth/actions";

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
const YEARS = ["Y1", "Y2", "Y3", "Y4", "Y5"];
const PERSONALITY = [
  { key: "personality", q: "Are you more...", options: ["Introvert", "Extrovert"] },
  { key: "prefer_working", q: "You prefer meeting...", options: ["Online", "Face-to-face"] },
  { key: "best_work_time", q: "You do your best work...", options: ["In the morning", "At night"] },
];
const LOCATIONS = ["North", "South", "East", "West", "On Campus", "Central"];

const STEPS = [
  { title: "Introduce yourself!", sub: "Let's start with the basics! This is how teammates will find you." },
  { title: "About me", sub: "A little more so teammates know who they're working with." },
  { title: "How do you work best?", sub: "This helps us match you with the right teammates." },
  { title: "What skills do you have?", sub: "Pick as many as apply. This helps teams find you for the right role." },
  { title: "Choose your interests", sub: "What kinds of projects excite you? Pick a few." },
  { title: "Projects & Links", sub: "Add links to your GitHub, portfolio, or other work! Or you can always do this later." },
];

function Field({ icon, optional, ...props }) {
  return (
    <div className="relative flex items-center" style={{ height: 52, borderRadius: 14, background: "#f3f1f8", paddingLeft: 48, paddingRight: 16 }}>
      <span className="absolute" style={{ left: 16 }}>{icon}</span>
      <input {...props} className="w-full bg-transparent focus:outline-none" style={{ fontSize: 14, fontWeight: 400, color: "#1d1b44" }} />
      {optional && <span className="absolute" style={{ right: 16, fontSize: 10, fontWeight: 800, letterSpacing: 0.4, color: "#c4b5fd" }}>optional</span>}
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
  link: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8696" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17H7a5 5 0 0 1 0-10h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8" /></svg>,
};

export default function SignupPage() {
  const router = useRouter();
  const [intro, setIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [d, setD] = useState({ full_name: "", username: "", email: "", password: "", university: "SUTD", major: "", year: "", gender: "", personality: "", prefer_working: "", best_work_time: "", location: "", skills: [], interests: [], linkedin_url: "", github_url: "", portfolio_url: "", pending_projects: [] });
  const [showLinks, setShowLinks] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({ role: "", write_up: "" });

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const toggle = (k, v) => setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const hasSkill = (n) => d.skills.some((s) => s.name === n);
  const toggleSkill = (n) => setD((s) => ({ ...s, skills: s.skills.some((x) => x.name === n) ? s.skills.filter((x) => x.name !== n) : [...s.skills, { name: n, level: "Basic" }] }));
  const setSkillLevel = (n, level) => setD((s) => ({ ...s, skills: s.skills.map((x) => (x.name === n ? { ...x, level } : x)) }));
  const canNext = () => {
    if (step === 0) return d.full_name && d.username && d.email && d.password.length >= 6;
    if (step === 1) return d.year && d.gender;
    if (step === 2) return PERSONALITY.every((p) => d[p.key]) && d.location;
    if (step === 3) return d.skills.length > 0;
    return true;
  };
  async function finish() {
    setSaving(true); setError("");
    const res = await signUpFull(d);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    setDone(true);
  }
  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : finish());
  const back = () => (step > 0 ? setStep(step - 1) : setIntro(true));

  /* ---------- COMPLETE ---------- */
  if (done) {
    return (
      <div className="relative flex w-[402px] flex-col items-center bg-white px-8 pt-40 text-center" style={{ height: 874 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/blob-teal.png" alt="" className="mb-8 h-32 w-32" style={{ borderRadius: 28 }} />
        <h1 className="text-[26px] font-extrabold text-navy">You&apos;re all set! 🎉</h1>
        <p className="mt-2 text-[16px] text-muted">Welcome to Groovp, {d.full_name.split(" ")[0] || "there"}. Time to find your team.</p>
        <button onClick={() => { router.push("/tutorial/1"); router.refresh(); }} className="mt-8 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[16px] font-bold text-white">
          Let&apos;s go
        </button>
      </div>
    );
  }

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
      <button onClick={back} className="absolute flex items-center justify-center rounded-full" style={{ left: 24, top: 48, width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1e1b4b" }}>‹</span>
      </button>
      <div className="absolute" style={{ left: 75, top: 52, fontSize: 24, fontWeight: 800, color: "#1e1b4b" }}>{s.title}</div>
      <div className="absolute" style={{ left: 25, top: 93, width: 350, fontSize: 13, fontWeight: 400, color: "#6b6678", lineHeight: "16px" }}>{s.sub}</div>

      {/* progress */}
      {STEPS.map((_, i) => {
        const gap = 9;
        const segW = (346 - gap * (STEPS.length - 1)) / STEPS.length;
        const x = 32 + i * (segW + gap);
        return <div key={i} className="absolute" style={{ left: x, top: 140, width: segW, height: 6, borderRadius: 3, background: i <= step ? "#7c3aed" : "#eae5fc" }} />;
      })}

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
          <div className="flex flex-col gap-3">
            <Field icon={I.book} optional placeholder="University" value={d.university} onChange={(e) => set("university", e.target.value)} />
            <Field icon={I.book} optional placeholder="Major (e.g. Computer Science)" value={d.major} onChange={(e) => set("major", e.target.value)} />
            <div>
              <p className="text-[13px] font-semibold text-navy">Year of study</p>
              <div className="mt-2 flex flex-wrap gap-2.5">{YEARS.map((y) => (
                <button key={y} type="button" onClick={() => set("year", y)} className="flex items-center justify-center rounded-full" style={{ width: 60, height: 40, background: d.year === y ? "#ece8fc" : "#f3f1f8", border: d.year === y ? "1px solid #7c3aed" : "1px solid transparent" }}>
                  <span style={{ fontSize: 13, fontWeight: d.year === y ? 600 : 400, color: d.year === y ? "#7c3aed" : "#1d1b44" }}>{y}</span>
                </button>
              ))}</div>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-[14px] font-semibold text-navy">How do you identify?</p>
              {["Woman", "Man", "Prefer not to say"].map((g) => (
                <button key={g} type="button" onClick={() => set("gender", g)} className="flex items-center justify-center rounded-full" style={{ height: 52, background: d.gender === g ? "#ece8fc" : "#f3f1f8", border: d.gender === g ? "1px solid #7c3aed" : "1px solid transparent" }}>
                  <span style={{ fontSize: 14, fontWeight: d.gender === g ? 600 : 400, color: d.gender === g ? "#7c3aed" : "#1d1b44" }}>{g}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            {PERSONALITY.map((p) => (
              <div key={p.key}>
                <p className="mb-2.5 text-[13.5px] font-semibold text-navy">{p.q}</p>
                <div className="flex gap-2.5">
                  {p.options.map((o) => (
                    <button key={o} type="button" onClick={() => set(p.key, o)} className="flex flex-1 items-center justify-center rounded-full" style={{ height: 46, background: d[p.key] === o ? "#ece8fc" : "#f3f1f8", border: d[p.key] === o ? "1px solid #7c3aed" : "1px solid transparent" }}>
                      <span style={{ fontSize: 13, fontWeight: d[p.key] === o ? 600 : 400, color: d[p.key] === o ? "#7c3aed" : "#1d1b44" }}>{o}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <p className="mb-2.5 text-[13.5px] font-semibold text-navy">Where do you stay?</p>
              <div className="flex flex-wrap gap-2.5">
                {LOCATIONS.map((loc) => (
                  <button key={loc} type="button" onClick={() => set("location", loc)} className="flex items-center justify-center rounded-full px-4" style={{ height: 40, background: d.location === loc ? "#ece8fc" : "#f3f1f8", border: d.location === loc ? "1px solid #7c3aed" : "1px solid transparent" }}>
                    <span style={{ fontSize: 12.5, fontWeight: d.location === loc ? 600 : 400, color: d.location === loc ? "#7c3aed" : "#1d1b44" }}>{loc === "On Campus" ? "Campus" : loc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2.5">
              {SKILL_OPTIONS.map((x) => <Chip key={x} active={hasSkill(x)} onClick={() => toggleSkill(x)}>{x}</Chip>)}
            </div>
            {d.skills.length > 0 && (
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-[15px] font-semibold text-navy">Set your skill level</p>
                  <p className="text-[11.5px] text-muted">For each skill, pick how confident you are.</p>
                </div>
                {d.skills.map((s) => (
                  <div key={s.name} className="flex items-center justify-between rounded-xl bg-[#f3f1f8] px-3 py-2">
                    <span className="text-[14px] font-semibold text-navy">{s.name}</span>
                    <div className="flex gap-1">
                      {["Basic", "Good", "Expert"].map((lv) => (
                        <button key={lv} type="button" onClick={() => setSkillLevel(s.name, lv)} className="rounded-md px-2.5 py-1 text-[11px] font-bold" style={{ background: s.level === lv ? "#7c3aed" : "#fff", color: s.level === lv ? "#fff" : "#757080" }}>{lv}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {step === 4 && (
          <div className="grid grid-cols-3 gap-x-2 gap-y-6">
            {INTEREST_OPTIONS.map(({ name, icon }) => {
              const active = d.interests.includes(name);
              return (
                <button key={name} type="button" onClick={() => toggle("interests", name)} className="flex flex-col items-center gap-2">
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
        {step === 5 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">Projects</p>
              {d.pending_projects.map((p, i) => (
                <div key={i} className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-[#f3f1f8] px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-navy">{p.role || "Project"}</p>
                    {p.write_up && <p className="truncate text-[12px] text-muted">{p.write_up}</p>}
                  </div>
                  <button type="button" onClick={() => setD((s) => ({ ...s, pending_projects: s.pending_projects.filter((_, idx) => idx !== i) }))} className="shrink-0 text-[12px] font-bold" style={{ color: "#bf4247" }}>Remove</button>
                </div>
              ))}
              {addingProject ? (
                <div className="flex flex-col gap-2 rounded-xl border border-line p-3">
                  <input placeholder="Role (e.g. Frontend Lead)" value={newProject.role} onChange={(e) => setNewProject((s) => ({ ...s, role: e.target.value }))} className="rounded-lg border border-line px-3 py-2 text-[13px] focus:outline-none" />
                  <textarea placeholder="What did you build?" value={newProject.write_up} onChange={(e) => setNewProject((s) => ({ ...s, write_up: e.target.value }))} rows={2} className="rounded-lg border border-line px-3 py-2 text-[13px] focus:outline-none" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { if (newProject.role) setD((s) => ({ ...s, pending_projects: [...s.pending_projects, newProject] })); setNewProject({ role: "", write_up: "" }); setAddingProject(false); }} className="flex-1 rounded-lg py-2 text-[13px] font-bold text-white" style={{ background: "#7c3aed" }}>Add</button>
                    <button type="button" onClick={() => { setAddingProject(false); setNewProject({ role: "", write_up: "" }); }} className="flex-1 rounded-lg py-2 text-[13px] font-bold text-navy" style={{ background: "#f3f1f8" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setAddingProject(true)} className="w-full rounded-2xl border-[1.5px] py-3 text-[13px] font-semibold" style={{ borderColor: "#7c3aed", color: "#7c3aed" }}>+ Add Project</button>
              )}
            </div>
            <div>
              <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">Links</p>
              {showLinks ? (
                <div className="flex flex-col gap-2.5">
                  <Field icon={I.link} placeholder="LinkedIn URL" value={d.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} />
                  <Field icon={I.link} placeholder="GitHub URL" value={d.github_url} onChange={(e) => set("github_url", e.target.value)} />
                  <Field icon={I.link} placeholder="Portfolio website URL" value={d.portfolio_url} onChange={(e) => set("portfolio_url", e.target.value)} />
                </div>
              ) : (
                <button type="button" onClick={() => setShowLinks(true)} className="w-full rounded-2xl border-[1.5px] py-3 text-[13px] font-semibold" style={{ borderColor: "#7c3aed", color: "#7c3aed" }}>+ Add Link</button>
              )}
            </div>
          </div>
        )}
        {error && <p className="mt-4 text-[14px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
      </div>

      {/* bottom buttons */}
      <button onClick={back} className="absolute flex items-center justify-center" style={{ left: 32, top: 762, width: 101, height: 51, borderRadius: 18, background: "#f3f1f8" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#1d1b44" }}>Cancel</span>
      </button>
      <button onClick={next} disabled={!canNext() || saving} className="absolute flex items-center justify-center disabled:opacity-50" style={{ left: 143, top: 762, width: 226, height: 51, borderRadius: 18, background: "#7c3aed" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{saving ? "Creating…" : step < STEPS.length - 1 ? "Next →" : step === 5 ? "Save" : "Finish"}</span>
      </button>
      {step === 5 && (
        <button onClick={finish} disabled={saving} className="absolute w-full text-center disabled:opacity-50" style={{ left: 32, top: 825, width: 338, fontSize: 12.5, fontWeight: 600, color: "#757080" }}>
          Skip for now
        </button>
      )}
    </div>
  );
}
