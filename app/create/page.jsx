"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/create/actions";

const SKILLS = ["Python", "React", "TypeScript", "Node.js", "SQL", "Figma", "UI/UX", "Java", "AI/ML", "FastAPI", "Design", "Research"];
const INTERESTS = ["AI & ML", "EdTech", "Sustainability", "Healthcare", "FinTech", "Hackathons", "Startups", "Research", "Design"];

const STEPS = [
  { title: "What kind of project is this?", sub: "This determines whether multiple groups can form under it." },
  { title: "Let's set up your project", sub: "Give it a name and describe what you're building." },
  { title: "Group settings", sub: "Set the team size and what you need from members." },
  { title: "Privacy & joining", sub: "Who can see it and how people join." },
];

const inputCls = "w-full rounded-[14px] bg-[#f3f1f8] px-4 text-[14px] text-navy focus:outline-none";
function Chip({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className="rounded-[10px] px-4 text-[12px] font-semibold" style={{ height: 34, background: active ? "#7c3aed" : "#f3f1f8", color: active ? "#fff" : "#1d1b44" }}>{children}</button>;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null); // {projectId, name, joinCode}
  const [copied, setCopied] = useState(false);
  const [d, setD] = useState({ type: "academic", name: "", description: "", timeline_start: "", timeline_end: "", min_size: 2, max_size: 5, skills: [], interests: [], project_link: "", privacy: "public", joining_method: "approval" });

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const toggle = (k, v) => setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const canNext = () => (step === 1 ? d.name.trim().length > 0 : true);

  // Team-size steppers that keep min ≤ max at all times.
  const bumpMin = (delta) => setD((s) => ({ ...s, min_size: Math.min(s.max_size, Math.max(1, s.min_size + delta)) }));
  const bumpMax = (delta) => setD((s) => ({ ...s, max_size: Math.min(50, Math.max(s.min_size, s.max_size + delta)) }));

  async function finish() {
    // Client-side guard: dates must be in order.
    if (d.timeline_start && d.timeline_end && d.timeline_start > d.timeline_end) {
      setStep(1); setError("End date can't be before the start date.");
      return;
    }
    setSaving(true); setError("");
    const res = await createProject(d);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    setDone({ projectId: res.projectId, name: res.name, joinCode: res.joinCode });
  }
  const next = () => (step < 3 ? setStep(step + 1) : finish());
  const back = () => (step > 0 ? setStep(step - 1) : router.push("/discover"));

  /* congrats */
  if (done) {
    return (
      <div className="relative flex w-[402px] flex-col items-center bg-white px-8 pt-40 text-center" style={{ height: 874 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/blob-teal.png" alt="" className="mb-8 h-32 w-32" style={{ borderRadius: 28 }} />
        <h1 className="text-[26px] font-extrabold text-navy">Congrats! 🎉</h1>
        <p className="mt-2 text-[16px] text-muted">You created <span className="font-bold text-navy">{done.name}</span>.</p>
        {done.joinCode && (
          <div className="mt-6 w-full rounded-2xl border border-dashed border-purple-300 bg-[#f9f7ff] p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Share this code with your classmates</p>
            <p className="mt-1 text-[24px] font-extrabold tracking-wider text-navy">{done.joinCode}</p>
            <button
              onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/join?code=${done.joinCode}`); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
              className="mt-3 w-full rounded-xl py-2.5 text-[13px] font-bold text-white"
              style={{ background: "#7c3aed" }}
            >
              {copied ? "Link copied ✓" : "Copy invite link"}
            </button>
          </div>
        )}
        <Link href={`/project/${done.projectId}`} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[16px] font-bold text-white">Go to project</Link>
        <Link href="/discover" className="mt-3 w-full rounded-2xl bg-[#f3f1f8] py-4 text-[16px] font-bold text-navy">Back to Discover</Link>
      </div>
    );
  }

  const s = STEPS[step];
  return (
    <div className="relative w-[402px] bg-white" style={{ height: 874 }}>
      <button onClick={back} className="absolute flex items-center justify-center rounded-full border border-line" style={{ left: 24, top: 50, width: 40, height: 40 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1e1b4b" }}>‹</span>
      </button>
      <div className="absolute" style={{ left: 75, top: 54, width: 300, fontSize: 24, fontWeight: 800, color: "#1d1b44", lineHeight: "29px" }}>{s.title}</div>
      <div className="absolute" style={{ left: 25, top: step === 0 ? 122 : 93, width: 350, fontSize: 12.5, fontWeight: 400, color: "#757080" }}>{s.sub}</div>

      {[32, 112, 192, 272].map((x, i) => (
        <div key={x} className="absolute" style={{ left: x, top: step === 0 ? 152 : 123, width: 70, height: 6, borderRadius: 3, background: i <= step ? "#7c3aed" : "#f3f1f8" }} />
      ))}

      <div className="absolute" style={{ left: 32, top: 182, width: 338, bottom: 100, overflowY: "auto" }}>
        {step === 0 && (
          <div className="flex flex-col gap-4">
            {[
              { v: "academic", t: "Academic / Coursework", d: "Tied to a course or module. Supports multiple independent groups forming in parallel.", tag: "Allows multiple groups" },
              { v: "personal", t: "Personal / Custom", d: "Hackathons, start-ups, side projects. One group forms for the whole project.", tag: "One group only" },
            ].map((c) => (
              <button key={c.v} type="button" onClick={() => set("type", c.v)} className="rounded-2xl p-5 text-left" style={{ background: d.type === c.v ? "#f3f1f8" : "#fff", border: `2px solid ${d.type === c.v ? "#7c3aed" : "#eee"}` }}>
                <p className="text-[16px] font-bold text-navy">{c.t}</p>
                <p className="mt-1 text-[12px] text-muted">{c.d}</p>
                <p className="mt-3 text-[11px] font-bold" style={{ color: d.type === c.v ? "#6126cc" : "#757080" }}>{c.tag}</p>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <input className={inputCls} style={{ height: 52 }} placeholder="Project name" value={d.name} onChange={(e) => set("name", e.target.value)} />
            <textarea className="w-full rounded-[14px] bg-[#f5f0ff] p-4 text-[13px] text-navy focus:outline-none" rows={5} placeholder="Describe your project — goals, what you're building, and what kind of teammates you need…" value={d.description} onChange={(e) => set("description", e.target.value)} />
            <div className="flex gap-3">
              <div className="flex-1"><p className="mb-1 text-[12px] font-semibold text-muted">Start</p><input type="date" className={inputCls} style={{ height: 44 }} value={d.timeline_start} onChange={(e) => set("timeline_start", e.target.value)} /></div>
              <div className="flex-1"><p className="mb-1 text-[12px] font-semibold text-muted">End</p><input type="date" className={inputCls} style={{ height: 44 }} value={d.timeline_end} onChange={(e) => set("timeline_end", e.target.value)} /></div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-[13px] font-bold text-navy">Team size</p>
              <div className="flex gap-3">
                {[["min_size", "Min", bumpMin], ["max_size", "Max", bumpMax]].map(([k, label, bump]) => (
                  <div key={k} className="flex flex-1 items-center justify-between rounded-[14px] bg-[#f3f1f8] px-4" style={{ height: 48 }}>
                    <span className="text-[10px] font-bold uppercase text-muted">{label}</span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => bump(-1)} className="text-[18px] font-bold text-purple-600">−</button>
                      <span className="text-[15px] font-bold text-navy">{d[k]}</span>
                      <button type="button" onClick={() => bump(1)} className="text-[18px] font-bold text-purple-600">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-bold text-navy">Skills needed</p>
              <div className="flex flex-wrap gap-2">{SKILLS.map((x) => <Chip key={x} active={d.skills.includes(x)} onClick={() => toggle("skills", x)}>{x}</Chip>)}</div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-bold text-navy">Related interests</p>
              <div className="flex flex-wrap gap-2">{INTERESTS.map((x) => <Chip key={x} active={d.interests.includes(x)} onClick={() => toggle("interests", x)}>{x}</Chip>)}</div>
            </div>
            <input className={inputCls} style={{ height: 48 }} placeholder="Add a resource link (optional)" value={d.project_link} onChange={(e) => set("project_link", e.target.value)} />
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-[13px] font-bold text-navy">Privacy</p>
              <div className="flex flex-col gap-2">
                {[["public", "Public — anyone can find it"], ["restricted", "Restricted — SUTD students only"], ["invite-only", "Invite-only"]].map(([v, label]) => (
                  <button key={v} type="button" onClick={() => set("privacy", v)} className="flex items-center gap-3 rounded-[14px] p-4 text-left" style={{ background: d.privacy === v ? "#f5f0ff" : "#f3f1f8", border: `1px solid ${d.privacy === v ? "#7c3aed" : "transparent"}` }}>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2" style={{ borderColor: d.privacy === v ? "#7c3aed" : "#c9c5d3" }}>{d.privacy === v && <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />}</span>
                    <span className="text-[14px] font-semibold text-navy">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-bold text-navy">Joining method</p>
              <div className="flex gap-2">
                {[["approval", "Approval required"], ["auto", "Auto-join"]].map(([v, label]) => (
                  <Chip key={v} active={d.joining_method === v} onClick={() => set("joining_method", v)}>{label}</Chip>
                ))}
              </div>
            </div>
          </div>
        )}
        {error && <p className="mt-4 text-[14px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
      </div>

      <button onClick={next} disabled={!canNext() || saving} className="absolute flex items-center justify-center disabled:opacity-50" style={{ left: 32, top: 792, width: 338, height: 56, borderRadius: 28, background: "linear-gradient(90deg,#7c3aed,#6126cc)" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{saving ? "Creating…" : step < 3 ? "Next →" : "Create project"}</span>
      </button>
    </div>
  );
}
