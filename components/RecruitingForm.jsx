"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveRecruiting } from "@/app/recruiting/[groupId]/actions";

const SKILLS = ["Python", "React", "TypeScript", "Node.js", "SQL", "Figma", "UI/UX", "Java", "AI/ML", "Design"];
const WORKING_STYLE = [
  { label: "Personality", options: ["Introvert", "Extrovert"] },
  { label: "Meeting Mode", options: ["Online", "Face-to-face"] },
  { label: "Active Time", options: ["Morning", "Night owl"] },
];
const INTERESTS = ["Sustainability", "EdTech", "Web Dev", "Healthcare", "Data Science", "Social Impact", "Robotics", "AI & ML", "Design"];

function Chip({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold" style={{ background: active ? "#7c3aed" : "#f3f1f8", color: active ? "#fff" : "#1d1b44" }}>{children}</button>;
}

export default function RecruitingForm({ groupId, initial }) {
  const router = useRouter();
  const [d, setD] = useState({
    recruiting: initial.recruiting ?? true,
    members_wanted: initial.members_wanted ?? 1,
    skills_wanted: initial.skills_wanted || [],
    personality_wanted: initial.personality_wanted || [],
    interests_wanted: initial.interests_wanted || [],
    additional_notes: initial.additional_notes || "",
    joining_method: initial.joining_method || "approval",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const toggle = (k, v) => setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  async function save() {
    setSaving(true); setSaved(false);
    const res = await saveRecruiting(groupId, d);
    setSaving(false);
    if (!res?.error) { setSaved(true); router.refresh(); }
  }

  return (
    <div className="flex flex-col gap-5 px-6 pb-8">
      {/* toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-4">
        <div>
          <p className="text-[15px] font-bold text-navy">Open to join requests</p>
          <p className="text-[13px] text-muted">{d.recruiting ? "People can request to join" : "Closed to new requests"}</p>
        </div>
        <button type="button" onClick={() => set("recruiting", !d.recruiting)} className="relative h-7 w-12 rounded-full transition-colors" style={{ background: d.recruiting ? "#7c3aed" : "#d6d3de" }}>
          <span className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all" style={{ left: d.recruiting ? 24 : 4 }} />
        </button>
      </div>

      {d.recruiting && (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-bold text-navy" style={{ maxWidth: 180 }}>How many more members are you looking for?</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => set("members_wanted", Math.max(0, d.members_wanted - 1))} className="text-[20px] font-bold text-purple-600">−</button>
              <span className="text-[18px] font-bold text-navy">{d.members_wanted}</span>
              <button type="button" onClick={() => set("members_wanted", d.members_wanted + 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-[16px] font-bold text-white" style={{ background: "#7c3aed" }}>+</button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-bold text-navy">Skills wanted</p>
            <div className="flex flex-wrap gap-2">{SKILLS.map((s) => <Chip key={s} active={d.skills_wanted.includes(s)} onClick={() => toggle("skills_wanted", s)}>{s}</Chip>)}</div>
          </div>
          <div>
            <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-muted">Working style wanted</p>
            <div className="flex flex-col gap-3">
              {WORKING_STYLE.map((w) => (
                <div key={w.label} className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-navy">{w.label}</span>
                  <div className="flex gap-2">{w.options.map((o) => <Chip key={o} active={d.personality_wanted.includes(o)} onClick={() => toggle("personality_wanted", o)}>{o}</Chip>)}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-bold text-navy">Interests wanted</p>
            <div className="flex flex-wrap gap-2">{INTERESTS.map((s) => <Chip key={s} active={d.interests_wanted.includes(s)} onClick={() => toggle("interests_wanted", s)}>{s}</Chip>)}</div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-bold text-navy">What are you looking for?</p>
            <textarea value={d.additional_notes} onChange={(e) => set("additional_notes", e.target.value)} rows={3} placeholder="e.g. Someone comfortable with backend APIs, ~10h/week" className="w-full rounded-xl border border-line bg-bgapp px-3 py-2.5 text-[14px] text-navy focus:outline-none" />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">Joining method</p>
            <div className="flex flex-col gap-2.5">
              {[
                ["approval", "Approval required", "You review each request before they join."],
                ["auto", "Auto-join", "Anyone can join instantly until the group is full."],
              ].map(([v, l, sub]) => (
                <button key={v} type="button" onClick={() => set("joining_method", v)} className="rounded-2xl p-4 text-left" style={{ background: d.joining_method === v ? "#f5f0ff" : "#f3f1f8", border: d.joining_method === v ? "1px solid #7c3aed" : "1px solid transparent" }}>
                  <p className="text-[14px] font-bold text-navy">{l}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{sub}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-2 flex flex-col gap-2.5">
        <button onClick={save} disabled={saving} className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-3.5 text-[15px] font-bold text-white disabled:opacity-50">
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
        </button>
        <button type="button" onClick={() => router.back()} className="w-full rounded-2xl py-3.5 text-[15px] font-bold text-navy" style={{ background: "#f3f1f8" }}>Cancel</button>
      </div>
    </div>
  );
}
