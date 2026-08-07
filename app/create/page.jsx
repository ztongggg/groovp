"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/create/actions";
import ResourceFileUpload from "@/components/ResourceFileUpload";
import AvatarUpload from "@/components/AvatarUpload";

const SKILLS = ["Python", "Figma", "AI/ML", "React", "TypeScript", "Node.js", "SQL", "UI/UX", "Java", "FastAPI", "Design", "Research"];
const INTERESTS = ["Sustainability", "EdTech", "Web Dev", "Healthcare", "Data Science", "Social Impact", "Robotics", "AI & ML", "Design"];

const STEPS = [
  { title: "What kind of project is this?", sub: "This determines whether multiple groups can form under it." },
  { title: "Let's set up your project", sub: "Give it a name and describe what you're building." },
  { title: "Group settings", sub: "Set the team size and what you need from members." },
  { title: "Privacy & joining", sub: "Control who can see this and how they join." },
];

const PRIVACY = [
  { v: "public", t: "Public", d: "Anyone on Groovp can find and view this project." },
  // The frame says "students in the linked course", but Restricted is
  // same-school in this app (owner decision, and what the RLS actually checks).
  { v: "restricted", t: "Restricted", d: "Only visible to students at your school." },
  { v: "invite-only", t: "Invite-only", d: "Only visible to people you share the link with." },
];

const ERR = "#DC2626";
const ERR_BG = "#FAE0E0";

function Stepper({ label, value, onBump, wide }) {
  return (
    <div style={{ width: wide ? 338 : 163, height: 48, background: "#F3F1F8", borderRadius: 14, position: "relative", flexShrink: 0 }}>
      <span style={{ position: "absolute", left: 16, top: 18, fontSize: 10, fontWeight: 600, color: "#1D1B44" }}>{label}</span>
      <button type="button" onClick={() => onBump(-1)} aria-label={`Decrease ${label}`} style={{ position: "absolute", left: wide ? 236 : 59, top: 10, width: 28, height: 28, borderRadius: 9999, background: "#EDE9FE", color: "#7C3AED", fontSize: 16, fontWeight: 900 }} className="font-nunito">−</button>
      <span style={{ position: "absolute", left: wide ? 272 : 95, top: 13, width: 20, textAlign: "center", fontSize: 18, fontWeight: 700, color: "#1D1B44" }}>{value}</span>
      <button type="button" onClick={() => onBump(1)} aria-label={`Increase ${label}`} style={{ position: "absolute", left: wide ? 300 : 123, top: 10, width: 28, height: 28, borderRadius: 9999, background: "#EDE9FE", color: "#7C3AED", fontSize: 16, fontWeight: 900 }} className="font-nunito">+</button>
    </div>
  );
}

function TagChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 32,
        borderRadius: 16,
        padding: "0 16px",
        fontSize: 11.5,
        fontWeight: active ? 700 : 400,
        background: active ? "#F3EDFE" : "#F3F1F8",
        color: active ? "#7C3AED" : "#1D1B44",
        border: active ? "1px solid #7C3AED" : "1px solid transparent",
      }}
    >
      {children}
    </button>
  );
}

function DateRow({ label, value, onChange, dotSize }) {
  return (
    <label style={{ display: "flex", alignItems: "center", height: 40, background: "#F5F0FF", paddingLeft: 19, paddingRight: 16 }}>
      <span style={{ width: dotSize, height: dotSize, borderRadius: 9999, background: "#7C3AED", flexShrink: 0 }} />
      <span style={{ marginLeft: 20 - (dotSize - 10) / 2, fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ marginLeft: "auto", background: "transparent", fontSize: 13, fontWeight: 500, color: "#1D1B44", outline: "none", textAlign: "right" }}
      />
    </label>
  );
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null); // {projectId, name, joinCode}
  const [copied, setCopied] = useState(false);
  const [skillQuery, setSkillQuery] = useState("");
  // Type starts unset: the frame has an error state for "make a selection".
  const [d, setD] = useState({ type: "", name: "", description: "", photo_url: "", timeline_start: "", timeline_end: "", min_size: 2, max_size: 5, number_of_groups: 1, skills: [], interests: [], project_link: "", resource_files: [], privacy: "public", joining_method: "approval" });
  const [touched, setTouched] = useState(false);

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const toggle = (k, v) => setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  const canNext = () => {
    if (step === 0) return !!d.type;
    if (step === 1) return d.name.trim().length > 0 && d.description.trim().length > 0;
    if (step === 2) return d.skills.length > 0;
    return true;
  };
  const typeErr = touched && step === 0 && !d.type;
  const nameErr = touched && step === 1 && !d.name.trim();
  const descErr = touched && step === 1 && !d.description.trim();
  const skillErr = touched && step === 2 && d.skills.length === 0;

  // Team-size steppers that keep min ≤ max at all times.
  const bumpMin = (delta) => setD((s) => ({ ...s, min_size: Math.min(s.max_size, Math.max(1, s.min_size + delta)) }));
  const bumpMax = (delta) => setD((s) => ({ ...s, max_size: Math.min(50, Math.max(s.min_size, s.max_size + delta)) }));

  async function finish() {
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
  const back = () => { setTouched(false); return step > 0 ? setStep(step - 1) : router.push("/discover"); };

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
  const low = step <= 1; // steps 0 and 1 sit lower in the frames
  const visibleSkills = SKILLS.filter((x) => x.toLowerCase().includes(skillQuery.trim().toLowerCase()));

  return (
    <div className="relative w-[402px] bg-white" style={{ minHeight: 874 }}>
      <button onClick={back} className="absolute flex items-center justify-center rounded-full" style={{ left: 24, top: 48, width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1D1B44" }}>‹</span>
      </button>
      <div className="absolute" style={{ left: 75, top: 54, width: 300, fontSize: 24, fontWeight: 800, color: "#1D1B44", lineHeight: "29px" }}>{s.title}</div>
      <div className="absolute" style={{ left: 25, top: low ? 122 : 93, width: 350, fontSize: 12.5, fontWeight: 400, color: "#757080" }}>{s.sub}</div>

      {[32, 112, 192, 272].map((x, i) => (
        <div key={x} className="absolute" style={{ left: x, top: low ? 152 : 123, width: 70, height: 6, borderRadius: 3, background: i <= step ? "#7C3AED" : "#F3F1F8" }} />
      ))}

      <div className="absolute" style={{ left: 32, top: low ? 182 : 144, width: 338, bottom: 110, overflowY: "auto" }}>
        {step === 0 && (
          <div className="flex flex-col gap-4">
            {[
              { v: "academic", t: "Academic", d: "Tied to a course or module. Supports multiple independent groups forming in parallel.", tag: "Allows multiple groups", tint: "#7C3AED" },
              { v: "personal", t: "Personal", d: "Hackathons, start-ups, side projects. One group forms for the whole project.", tag: "One group only", tint: "#4AC7B2" },
            ].map((c) => {
              const on = d.type === c.v;
              return (
                <button
                  key={c.v}
                  type="button"
                  onClick={() => { set("type", c.v); setTouched(false); }}
                  className="text-left"
                  style={{
                    width: 338,
                    borderRadius: 20,
                    padding: 20,
                    background: typeErr ? ERR_BG : on ? "#ECE8FC" : "#fff",
                    border: `${typeErr ? 1.5 : 1}px solid ${typeErr ? ERR : on ? "#7C3AED" : "#E5E7EB"}`,
                  }}
                >
                  <div style={{ display: "flex", gap: 14 }}>
                    <span style={{ width: 48, height: 48, borderRadius: 9999, background: c.tint, flexShrink: 0 }} />
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: "#1D1B44" }}>{c.t}</span>
                      <span style={{ display: "block", marginTop: 6, fontSize: 12, color: "#757080", lineHeight: "17px" }}>{c.d}</span>
                    </span>
                  </div>
                  <p style={{ marginTop: 14, fontSize: 11, fontWeight: 600, color: on ? "#6126CC" : "#757080" }}>{c.tag}</p>
                </button>
              );
            })}
            {typeErr && <p style={{ fontSize: 11, color: ERR }}>Please make a selection to continue.</p>}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <AvatarUpload url={d.photo_url} onChange={(url) => set("photo_url", url)} size={76} outline caption="Add project photo" />
            </div>
            <div>
              <input
                placeholder="Project name"
                value={d.name}
                onChange={(e) => set("name", e.target.value)}
                style={{ width: "100%", height: 52, borderRadius: 14, background: nameErr ? ERR_BG : "#F3F1F8", border: nameErr ? `1.5px solid ${ERR}` : "1.5px solid transparent", padding: "0 16px", fontSize: 14, color: "#1D1B44", outline: "none" }}
              />
              {nameErr && <p style={{ marginTop: 6, fontSize: 11, color: ERR }}>This field cannot be left empty.</p>}
            </div>
            <div>
              <textarea
                rows={6}
                placeholder="Describe your project — goals, what you're building, and what kind of teammates you need..."
                value={d.description}
                onChange={(e) => set("description", e.target.value)}
                style={{ width: "100%", height: 140, borderRadius: 14, background: descErr ? ERR_BG : "#F3F1F8", border: descErr ? `1.5px solid ${ERR}` : "1px solid #F3F1F8", padding: 16, fontSize: 13, color: "#1D1B44", outline: "none", resize: "none" }}
              />
              {descErr && <p style={{ marginTop: 6, fontSize: 11, color: ERR }}>Please add a short description of your project.</p>}
            </div>
            <div style={{ position: "relative" }}>
              <DateRow label="Start" value={d.timeline_start} onChange={(v) => set("timeline_start", v)} dotSize={10} />
              <DateRow label="End" value={d.timeline_end} onChange={(v) => set("timeline_end", v)} dotSize={12} />
              <span style={{ position: "absolute", left: 24, top: 25, width: 1, height: 27, background: "#7C3AED" }} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Team size</p>
              <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
                <Stepper label="Min" value={d.min_size} onBump={bumpMin} />
                <Stepper label="Max" value={d.max_size} onBump={bumpMax} />
              </div>
              {d.type === "academic" && (
                <div style={{ marginTop: 14 }}>
                  <Stepper wide label="Number of Teams" value={d.number_of_groups} onBump={(delta) => set("number_of_groups", Math.min(20, Math.max(1, d.number_of_groups + delta)))} />
                </div>
              )}
            </div>

            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Skills needed</p>
              <div style={{ marginTop: 10, height: 50, borderRadius: 25, background: skillErr ? ERR_BG : "#F3F1F8", border: skillErr ? `1.5px solid ${ERR}` : "1.5px solid transparent", display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757080" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
                <input value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} placeholder="Find more of your skills" className="flex-1 bg-transparent focus:outline-none" style={{ fontSize: 13, color: "#1D1B44" }} />
              </div>
              {skillErr && <p style={{ marginTop: 6, fontSize: 11, color: ERR }}>Please select at least one skill.</p>}
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {visibleSkills.map((x) => <TagChip key={x} active={d.skills.includes(x)} onClick={() => toggle("skills", x)}>{x}</TagChip>)}
                {visibleSkills.length === 0 && <p style={{ fontSize: 12, color: "#757080" }}>No skills match &quot;{skillQuery}&quot;.</p>}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Interests needed</p>
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {INTERESTS.map((x) => <TagChip key={x} active={d.interests.includes(x)} onClick={() => toggle("interests", x)}>{x}</TagChip>)}
              </div>
            </div>

            <input
              placeholder="Add a resource link (optional)"
              value={d.project_link}
              onChange={(e) => set("project_link", e.target.value)}
              style={{ width: "100%", height: 48, borderRadius: 14, background: "#F3F1F8", padding: "0 16px", fontSize: 12.5, color: "#1D1B44", outline: "none" }}
            />
            <ResourceFileUpload files={d.resource_files} onChange={(files) => set("resource_files", files)} />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Privacy</p>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {PRIVACY.map((p) => {
                  const on = d.privacy === p.v;
                  return (
                    <button key={p.v} type="button" onClick={() => set("privacy", p.v)} className="relative text-left" style={{ height: 58, borderRadius: 14, background: on ? "#ECE8FC" : "#F3F1F8", border: `1px solid ${on ? "#7C3AED" : "transparent"}`, padding: "12px 16px" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>{p.t}</p>
                      <p style={{ marginTop: 6, fontSize: 11, color: "#757080", paddingRight: 34 }}>{p.d}</p>
                      {on && (
                        <span style={{ position: "absolute", right: 16, top: 19, width: 20, height: 20, borderRadius: 9999, background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7" /></svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Joining method</p>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                {[["approval", "Approval required"], ["auto", "Auto-join"]].map(([v, label]) => (
                  <TagChip key={v} active={d.joining_method === v} onClick={() => set("joining_method", v)}>{label}</TagChip>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-[14px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
      </div>

      <div className="absolute" style={{ left: 32, bottom: 24, width: 338, display: "flex", gap: 10 }}>
        {step > 0 && (
          <button onClick={back} style={{ width: 101, height: 56, borderRadius: 18, background: "#F3F1F8", fontSize: 14, color: "#1D1B44" }}>Back</button>
        )}
        <button
          onClick={next}
          disabled={saving}
          style={{ flex: 1, height: 56, borderRadius: step > 0 ? 18 : 28, background: "linear-gradient(90deg,#7C3AED,#6126CC)", boxShadow: "0px 6px 18px rgba(124,58,237,0.22)", fontSize: 16, fontWeight: 600, color: "#fff", opacity: saving ? 0.5 : 1 }}
        >
          {saving ? "Creating…" : step < 3 ? "Next →" : "Create Project →"}
        </button>
      </div>
    </div>
  );
}
