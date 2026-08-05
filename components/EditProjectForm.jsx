"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProject } from "@/app/project/[id]/edit/actions";
import ResourceFileUpload from "@/components/ResourceFileUpload";
import AvatarUpload from "@/components/AvatarUpload";

const SKILLS = ["Python", "React", "TypeScript", "Node.js", "SQL", "Figma", "UI/UX", "Java", "AI/ML", "FastAPI", "Design", "Research"];
const INTERESTS = ["Sustainability", "EdTech", "Web Dev", "Healthcare", "Data Science", "Social Impact", "Robotics", "AI & ML", "Design"];

const inputCls = "w-full rounded-[14px] bg-[#f3f1f8] px-4 py-3 text-[14px] text-navy focus:outline-none";
function Chip({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className="rounded-[10px] px-4 text-[12px] font-semibold" style={{ height: 34, background: active ? "#7c3aed" : "#f3f1f8", color: active ? "#fff" : "#1d1b44" }}>{children}</button>;
}

export default function EditProjectForm({ project }) {
  const router = useRouter();
  const [d, setD] = useState({
    name: project.name || "",
    description: project.description || "",
    photo_url: project.photo_url || "",
    timeline_start: project.timeline_start || "",
    timeline_end: project.timeline_end || "",
    min_size: project.min_size || 2,
    max_size: project.max_size || 5,
    skills: project.skills_needed || [],
    interests: project.interests || [],
    project_link: project.project_link || "",
    resource_files: (project.resource_files || []).map((url) => ({ url, name: url.split("/").pop() })),
    privacy: project.privacy || "public",
    joining_method: project.joining_method || "approval",
    course_code: project.course_code || "",
    instructor: project.instructor || "",
    things_to_note: project.things_to_note || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => { setD((s) => ({ ...s, [k]: v })); setSaved(false); };
  const toggle = (k, v) => { setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] })); setSaved(false); };
  const bumpMin = (delta) => set("min_size", Math.min(d.max_size, Math.max(1, d.min_size + delta)));
  const bumpMax = (delta) => set("max_size", Math.min(50, Math.max(d.min_size, d.max_size + delta)));

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    const res = await updateProject(project.id, d);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="mt-5 flex flex-col gap-5 px-6 pb-8">
      <div className="flex justify-center"><AvatarUpload url={d.photo_url} onChange={(url) => set("photo_url", url)} /></div>
      <input className={inputCls} placeholder="Project name" value={d.name} onChange={(e) => set("name", e.target.value)} />
      <textarea className="w-full rounded-[14px] bg-[#f5f0ff] p-4 text-[13px] text-navy focus:outline-none" rows={4} placeholder="Description" value={d.description} onChange={(e) => set("description", e.target.value)} />

      {project.type === "academic" && (
        <div className="flex gap-3">
          <input className={inputCls} placeholder="Course code" value={d.course_code} onChange={(e) => set("course_code", e.target.value)} />
          <input className={inputCls} placeholder="Instructor" value={d.instructor} onChange={(e) => set("instructor", e.target.value)} />
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1"><p className="mb-1 text-[12px] font-semibold text-muted">Start</p><input type="date" className={inputCls} value={d.timeline_start} onChange={(e) => set("timeline_start", e.target.value)} /></div>
        <div className="flex-1"><p className="mb-1 text-[12px] font-semibold text-muted">End</p><input type="date" className={inputCls} value={d.timeline_end} onChange={(e) => set("timeline_end", e.target.value)} /></div>
      </div>

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

      <input className={inputCls} placeholder="Resource link (optional)" value={d.project_link} onChange={(e) => set("project_link", e.target.value)} />
      <ResourceFileUpload files={d.resource_files} onChange={(files) => set("resource_files", files)} />
      <textarea className={inputCls} rows={2} placeholder="Things to note (optional)" value={d.things_to_note} onChange={(e) => set("things_to_note", e.target.value)} />

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

      {error && <p className="text-[13px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}

      <button onClick={save} disabled={saving} className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-3.5 text-[15px] font-bold text-white disabled:opacity-50">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </div>
  );
}
