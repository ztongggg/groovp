"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveRecruiting } from "@/app/recruiting/[groupId]/actions";

const SKILLS = ["Python", "React", "TypeScript", "Node.js", "SQL", "Figma", "UI/UX", "Java", "AI/ML", "Design"];
const PERSONALITY = ["Introvert", "Extrovert", "Online", "Face-to-face", "Morning", "Night owl"];
const INTERESTS = ["AI & ML", "EdTech", "Sustainability", "Healthcare", "Hackathons", "Startups", "Design", "Research"];

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
          <div>
            <p className="mb-2 text-[13px] font-bold text-navy">How many more members?</p>
            <div className="flex w-fit items-center gap-5 rounded-2xl bg-[#f3f1f8] px-5 py-3">
              <button type="button" onClick={() => set("members_wanted", Math.max(0, d.members_wanted - 1))} className="text-[20px] font-bold text-purple-600">−</button>
              <span className="text-[18px] font-bold text-navy">{d.members_wanted}</span>
              <button type="button" onClick={() => set("members_wanted", d.members_wanted + 1)} className="text-[20px] font-bold text-purple-600">+</button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-bold text-navy">Skills wanted</p>
            <div className="flex flex-wrap gap-2">{SKILLS.map((s) => <Chip key={s} active={d.skills_wanted.includes(s)} onClick={() => toggle("skills_wanted", s)}>{s}</Chip>)}</div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-bold text-navy">Personality wanted</p>
            <div className="flex flex-wrap gap-2">{PERSONALITY.map((s) => <Chip key={s} active={d.personality_wanted.includes(s)} onClick={() => toggle("personality_wanted", s)}>{s}</Chip>)}</div>
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
            <p className="mb-2 text-[13px] font-bold text-navy">Joining method</p>
            <div className="flex gap-2">
              {[["approval", "Approval required"], ["auto", "Auto-join"]].map(([v, l]) => <Chip key={v} active={d.joining_method === v} onClick={() => set("joining_method", v)}>{l}</Chip>)}
            </div>
          </div>
        </>
      )}

      <button onClick={save} disabled={saving} className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-3.5 text-[15px] font-bold text-white disabled:opacity-50">
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save settings"}
      </button>
    </div>
  );
}
