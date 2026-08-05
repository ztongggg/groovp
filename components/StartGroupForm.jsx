"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroupInProject } from "@/app/project/[id]/actions";
import AvatarUpload from "@/components/AvatarUpload";

const SKILLS = ["Python", "React", "TypeScript", "Node.js", "SQL", "Figma", "UI/UX", "Java", "AI/ML", "FastAPI", "Design", "Research"];
const INTERESTS = ["Sustainability", "EdTech", "Web Dev", "Healthcare", "Data Science", "Social Impact", "Robotics", "AI & ML", "Design"];

function Chip({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className="rounded-[10px] px-4 py-2 text-[12px] font-semibold" style={{ background: active ? "#7c3aed" : "#f3f1f8", color: active ? "#fff" : "#1d1b44" }}>{children}</button>;
}
const inputCls = "w-full rounded-[14px] bg-[#f3f1f8] px-4 py-3 text-[14px] text-navy focus:outline-none";

// Start a New Group (Figma node 1060:1054) — real form, not a one-click auto-name.
// No joining-method selector here on purpose (that's Recruiting Settings' job, reached
// right after creation).
export default function StartGroupForm({ projectId }) {
  const router = useRouter();
  const [d, setD] = useState({ name: "", photo_url: "", min_members: 2, max_members: 5, skills_wanted: [], interests_wanted: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const toggle = (k, v) => setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const bumpMin = (delta) => set("min_members", Math.min(d.max_members, Math.max(1, d.min_members + delta)));
  const bumpMax = (delta) => set("max_members", Math.min(50, Math.max(d.min_members, d.max_members + delta)));

  async function submit() {
    if (!d.name.trim()) { setError("Give your group a name."); return; }
    setSaving(true); setError("");
    const res = await createGroupInProject(projectId, d);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    router.push(`/recruiting/${res.groupId}`);
  }

  return (
    <div className="mt-5 flex flex-col gap-5 px-6 pb-8">
      <div className="flex justify-center"><AvatarUpload url={d.photo_url} onChange={(url) => set("photo_url", url)} /></div>

      <input className={inputCls} placeholder="Group name" value={d.name} onChange={(e) => set("name", e.target.value)} />

      <div>
        <p className="mb-2 text-[13px] font-bold text-navy">Team size</p>
        <div className="flex gap-3">
          {[["min_members", "Min", bumpMin], ["max_members", "Max", bumpMax]].map(([k, label, bump]) => (
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
        <div className="flex flex-wrap gap-2">{SKILLS.map((x) => <Chip key={x} active={d.skills_wanted.includes(x)} onClick={() => toggle("skills_wanted", x)}>{x}</Chip>)}</div>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-bold text-navy">Interests needed</p>
        <div className="flex flex-wrap gap-2">{INTERESTS.map((x) => <Chip key={x} active={d.interests_wanted.includes(x)} onClick={() => toggle("interests_wanted", x)}>{x}</Chip>)}</div>
      </div>

      {error && <p className="text-[13px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}

      <button onClick={submit} disabled={saving} className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-3.5 text-[15px] font-bold text-white disabled:opacity-50">
        {saving ? "Creating…" : "Create group"}
      </button>
    </div>
  );
}
