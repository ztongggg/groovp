"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/create/actions";
import ResourceFileUpload from "@/components/ResourceFileUpload";
import AvatarUpload from "@/components/AvatarUpload";
import CoverImageUpload from "@/components/CoverImageUpload";

const SKILLS = ["Python", "React", "TypeScript", "Node.js", "SQL", "Figma", "UI/UX", "Java", "AI/ML", "FastAPI", "Design", "Research"];
const INTERESTS = ["Sustainability", "EdTech", "Web Dev", "Healthcare", "Data Science", "Social Impact", "Robotics", "AI & ML", "Design"];

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
  const [d, setD] = useState({ type: "academic", name: "", description: "", photo_url: "", cover_image_url: "", timeline_start: "", timeline_end: "", min_size: 2, max_size: 5, number_of_groups: 1, skills: [], interests: [], project_link: "", resource_files: [], privacy: "public", joining_method: "approval" });
  const [touched, setTouched] = useState(false);

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const toggle = (k, v) => setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const canNext = () => (step === 1 ? d.name.trim().length > 0 && d.description.trim().length > 0 : true);
  const nameErr = touched && step === 1 && !d.name.trim() ? "This field cannot be left empty." : "";
  const descErr = touched && step === 1 && !d.description.trim() ? "Please add a short description of your project." : "";

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
  const next = () => {
    if (!canNext()) { setTouched(true); return; }
    setTouched(false);
    step < 3 ? setStep(step + 1) : finish();
  };
  const back = () => (step > 0 ? setStep(step - 1) : router.push("/discover"));

  /* congrats */
  if (done) {
    const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${done.joinCode}`;
    const confetti = [
      { l: 48, t: 120, w: 22, h: 22, r: 999, bg: "#f2a5bd" },
      { l: 200, t: 100, w: 8, h: 8, r: 999, bg: "#f2a5bd" },
      { l: 340, t: 148, w: 22, h: 22, r: 6, bg: "#7c3aed", rot: 20 },
      { l: 88, t: 205, w: 32, h: 11, r: 6, bg: "#ffb800", rot: -30 },
      { l: 282, t: 235, w: 32, h: 11, r: 6, bg: "#ffb800", rot: 30 },
      { l: 362, t: 265, w: 8, h: 8, r: 999, bg: "#7c3aed" },
      { l: 60, t: 335, w: 8, h: 8, r: 999, bg: "#dcf674" },
    ];
    return (
      <div className="relative w-[402px] bg-white" style={{ height: 874 }}>
        {confetti.map((c, i) => <span key={i} className="absolute" style={{ left: c.l, top: c.t, width: c.w, height: c.h, borderRadius: c.r, background: c.bg, transform: c.rot ? `rotate(${c.rot}deg)` : undefined }} />)}
        <div className="absolute" style={{ left: 151, top: 210, width: 100, height: 100 }}>
          <div className="absolute" style={{ background: "#ff4625", inset: "0% 15% 0% 16%", borderTopLeftRadius: 37, borderTopRightRadius: 37, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }} />
          <div className="absolute rounded-full" style={{ background: "#071a3d", left: 30, top: 42, width: 9, height: 9 }} />
          <div className="absolute rounded-full" style={{ background: "#071a3d", left: 62, top: 42, width: 9, height: 9 }} />
          <div className="absolute" style={{ background: "#6d1b2a", left: 44, top: 58, width: 12, height: 6, borderRadius: "0 0 6px 6px" }} />
        </div>
        <p className="absolute w-full text-center" style={{ top: 328, fontSize: 26, fontWeight: 800, color: "#1d1b44" }}>Congrats!</p>
        <p className="absolute w-full text-center" style={{ top: 366, fontSize: 15, fontWeight: 700, color: "#1d1b44" }}>You created &quot;{done.name}&quot;</p>
        <p className="absolute w-full text-center" style={{ top: 392, fontSize: 13, color: "#757080", padding: "0 32px" }}>Copy the code below and share it so people can find and request to join.</p>

        {done.joinCode && (
          <>
            <div className="absolute flex items-center justify-between" style={{ left: 32, top: 452, width: 338, height: 52, borderRadius: 16, background: "#f3f1f8" }}>
              <span className="pl-4 text-[16px] font-extrabold tracking-wider text-navy">{done.joinCode}</span>
              <button
                onClick={() => { navigator.clipboard?.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
                className="mr-1.5 rounded-xl px-4 py-2 text-[13px] font-bold text-white"
                style={{ background: "#7c3aed" }}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
            <button
              onClick={() => { if (navigator.share) navigator.share({ title: done.name, url: inviteLink }); else { navigator.clipboard?.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 1600); } }}
              className="absolute flex items-center justify-center"
              style={{ left: 32, top: 520, width: 338, height: 48, borderRadius: 16, background: "#f3f1f8" }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1b44" }}>Share to…</span>
            </button>
          </>
        )}

        <Link href={`/project/${done.projectId}`} className="absolute flex items-center justify-center gap-2" style={{ left: 32, top: 800, width: 338, height: 56, borderRadius: 28, background: "linear-gradient(90deg,#7c3aed,#6126cc)" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Go to Project →</span>
        </Link>
      </div>
    );
  }

  const s = STEPS[step];
  return (
    <div className="relative w-[402px] bg-white" style={{ height: 874 }}>
      <button onClick={back} className="absolute flex items-center justify-center rounded-full" style={{ left: 24, top: 48, width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}>
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
            <CoverImageUpload url={d.cover_image_url} onChange={(url) => set("cover_image_url", url)} />
            <div className="mb-1 flex justify-center"><AvatarUpload url={d.photo_url} onChange={(url) => set("photo_url", url)} /></div>
            <input className={inputCls} style={{ height: 52, background: nameErr ? "#fae0e0" : undefined, border: nameErr ? "1px solid #d44d52" : undefined }} placeholder="Project name" value={d.name} onChange={(e) => set("name", e.target.value)} />
            {nameErr && <p className="text-[12px] font-semibold" style={{ color: "#d44d52" }}>{nameErr}</p>}
            <textarea className="w-full rounded-[14px] p-4 text-[13px] text-navy focus:outline-none" style={{ background: descErr ? "#fae0e0" : "#f5f0ff", border: descErr ? "1px solid #d44d52" : undefined }} rows={5} placeholder="Describe your project — goals, what you're building, and what kind of teammates you need…" value={d.description} onChange={(e) => set("description", e.target.value)} />
            {descErr && <p className="text-[12px] font-semibold" style={{ color: "#d44d52" }}>{descErr}</p>}
            <div className="flex gap-3">
              <div className="flex-1"><p className="mb-1 text-[12px] font-semibold text-muted">Start</p><input type="date" className={inputCls} style={{ height: 44 }} value={d.timeline_start} onChange={(e) => set("timeline_start", e.target.value)} /></div>
              <div className="flex-1"><p className="mb-1 text-[12px] font-semibold text-muted">End</p><input type="date" className={inputCls} style={{ height: 44 }} value={d.timeline_end} onChange={(e) => set("timeline_end", e.target.value)} /></div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            {d.type === "academic" && (
              <div>
                <p className="mb-2 text-[13px] font-bold text-navy">Number of groups</p>
                <div className="flex w-fit items-center gap-5 rounded-[14px] bg-[#f3f1f8] px-5 py-3">
                  <button type="button" onClick={() => set("number_of_groups", Math.max(1, d.number_of_groups - 1))} className="text-[18px] font-bold text-purple-600">−</button>
                  <span className="text-[15px] font-bold text-navy">{d.number_of_groups}</span>
                  <button type="button" onClick={() => set("number_of_groups", Math.min(20, d.number_of_groups + 1))} className="text-[18px] font-bold text-purple-600">+</button>
                </div>
              </div>
            )}
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
            <ResourceFileUpload files={d.resource_files} onChange={(files) => set("resource_files", files)} />
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-[13px] font-bold text-navy">Privacy</p>
              <div className="flex flex-col gap-2">
                {[["public", "Public — anyone can find it"], ["restricted", "Restricted — same school only"], ["invite-only", "Invite-only"]].map(([v, label]) => (
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

      <button onClick={next} disabled={saving} className="absolute flex items-center justify-center disabled:opacity-50" style={{ left: 32, top: 792, width: 338, height: 56, borderRadius: 28, background: "linear-gradient(90deg,#7c3aed,#6126cc)" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{saving ? "Creating…" : step < 3 ? "Next →" : "Create Project"}</span>
      </button>
    </div>
  );
}
