"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroupInProject } from "@/app/project/[id]/actions";
import AvatarUpload from "@/components/AvatarUpload";

const SKILLS = ["Python", "Figma", "AI/ML", "React", "TypeScript", "Node.js", "SQL", "UI/UX", "Java", "FastAPI", "Design", "Research"];
const INTERESTS = ["Sustainability", "EdTech", "Web Dev", "Healthcare", "Data Science", "Social Impact", "Robotics", "AI & ML", "Design"];

function TagChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ height: 32, borderRadius: 16, padding: "0 16px", fontSize: 11.5, fontWeight: active ? 700 : 400, background: active ? "#F3EDFE" : "#F3F1F8", color: active ? "#7C3AED" : "#1D1B44", border: active ? "1px solid #7C3AED" : "1px solid transparent" }}
    >
      {children}
    </button>
  );
}

function Stepper({ label, value, onBump }) {
  return (
    <div style={{ width: 163, height: 48, background: "#F3F1F8", borderRadius: 14, position: "relative", flexShrink: 0 }}>
      <span style={{ position: "absolute", left: 16, top: 18, fontSize: 10, fontWeight: 600, color: "#1D1B44" }}>{label}</span>
      <button type="button" onClick={() => onBump(-1)} aria-label={`Decrease ${label}`} style={{ position: "absolute", left: 59, top: 10, width: 28, height: 28, borderRadius: 9999, background: "#EDE9FE", color: "#7C3AED", fontSize: 16, fontWeight: 900 }} className="font-nunito">−</button>
      <span style={{ position: "absolute", left: 95, top: 13, width: 20, textAlign: "center", fontSize: 18, fontWeight: 700, color: "#1D1B44" }}>{value}</span>
      <button type="button" onClick={() => onBump(1)} aria-label={`Increase ${label}`} style={{ position: "absolute", left: 123, top: 10, width: 28, height: 28, borderRadius: 9999, background: "#EDE9FE", color: "#7C3AED", fontSize: 16, fontWeight: 900 }} className="font-nunito">+</button>
    </div>
  );
}

// Start a New Group (Figma "Start a New Group") — real form, not a one-click
// auto-name. No approval/auto-join selector here on purpose (that's Recruiting
// Settings' job, reached right after creation) — the frame's own "Open to join
// requests" row is the plain recruiting on/off flag, not that method choice.
export default function StartGroupForm({ projectId, projectName }) {
  const router = useRouter();
  const [d, setD] = useState({ name: "", photo_url: "", min_members: 2, max_members: 5, skills_wanted: [], interests_wanted: [], recruiting: true });
  const [skillQuery, setSkillQuery] = useState("");
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

  const visibleSkills = SKILLS.filter((x) => x.toLowerCase().includes(skillQuery.trim().toLowerCase()));

  return (
    <div style={{ padding: "0 24px 32px" }}>
      <p style={{ marginTop: 12, fontSize: 12.5, color: "#757080", lineHeight: "18px" }}>
        Create a group under &ldquo;{projectName || "this project"}&rdquo;.
      </p>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
        <AvatarUpload url={d.photo_url} onChange={(url) => set("photo_url", url)} size={76} outline caption="Add group photo" />
      </div>

      <p style={{ marginTop: 24, fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Group name</p>
      <input
        placeholder="e.g. Luminary"
        value={d.name}
        onChange={(e) => set("name", e.target.value)}
        style={{ marginTop: 6, width: "100%", height: 50, borderRadius: 14, background: "#F3F1F8", padding: "0 16px", fontSize: 14, color: "#1D1B44", outline: "none" }}
      />

      <p style={{ marginTop: 24, fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Team size</p>
      <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
        <Stepper label="Min" value={d.min_members} onBump={bumpMin} />
        <Stepper label="Max" value={d.max_members} onBump={bumpMax} />
      </div>

      <div style={{ marginTop: 24, height: 50, borderRadius: 25, background: "#F3F1F8", display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757080" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
        <input value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} placeholder="Find more of your skills" className="flex-1 bg-transparent focus:outline-none" style={{ fontSize: 13, color: "#1D1B44" }} />
      </div>

      <p style={{ marginTop: 24, fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Skills needed</p>
      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {visibleSkills.map((x) => <TagChip key={x} active={d.skills_wanted.includes(x)} onClick={() => toggle("skills_wanted", x)}>{x}</TagChip>)}
      </div>

      <p style={{ marginTop: 24, fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Interests needed</p>
      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {INTERESTS.map((x) => <TagChip key={x} active={d.interests_wanted.includes(x)} onClick={() => toggle("interests_wanted", x)}>{x}</TagChip>)}
      </div>

      <p style={{ marginTop: 30, fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Joining</p>
      <div style={{ marginTop: 10, height: 64, background: "#F3F1F8", borderRadius: 16, position: "relative", padding: "14px 16px" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Open to join requests</p>
        <p style={{ marginTop: 6, fontSize: 11.5, color: "#757080" }}>Anyone can request to join this group</p>
        <button
          type="button"
          role="switch"
          aria-checked={d.recruiting}
          onClick={() => set("recruiting", !d.recruiting)}
          style={{ position: "absolute", right: 16, top: 19, width: 44, height: 26, borderRadius: 13, background: d.recruiting ? "#7C3AED" : "#D9D4E0" }}
        >
          <span style={{ position: "absolute", top: 3, left: d.recruiting ? 21 : 3, width: 20, height: 20, borderRadius: 9999, background: "#fff", transition: "left 120ms" }} />
        </button>
      </div>

      {error && <p style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: "#bf4247" }}>{error}</p>}

      <button
        onClick={submit}
        disabled={saving}
        style={{ marginTop: 24, width: "100%", height: 56, borderRadius: 28, background: "#7C3AED", boxShadow: "0px 6px 18px rgba(124,58,237,0.22)", fontSize: 16, fontWeight: 600, color: "#fff", opacity: saving ? 0.5 : 1 }}
      >
        {saving ? "Creating…" : "Create Group"}
      </button>
    </div>
  );
}
