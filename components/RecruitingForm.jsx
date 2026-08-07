"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveRecruiting } from "@/app/recruiting/[groupId]/actions";
import SkillPicker from "@/components/SkillPicker";

// These three rows are what actually fills personality_wanted. The Figma frame
// also shows a separate "PERSONALITY WANTED" chip block holding the same
// values — two pickers writing one array would fight each other, so only the
// labelled rows are rendered.
const WORKING_STYLE = [
  { label: "Personality", options: ["Introvert", "Extrovert"] },
  { label: "Meeting Mode", options: ["Online", "Face-to-face"] },
  { label: "Active Time", options: ["Morning", "Night owl"] },
];
const INTERESTS = ["Sustainability", "EdTech", "Web Dev", "Healthcare", "Data Science", "Social Impact", "Robotics", "AI & ML", "Design"];

const LABEL = { fontSize: 11, fontWeight: 700, color: "#757080" };

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 30,
        borderRadius: 15,
        padding: "0 14px",
        fontSize: 11.5,
        fontWeight: 600,
        background: active ? "#F3EDFE" : "#F3F1F8",
        color: active ? "#7C3AED" : "#1D1B44",
        border: `1px solid ${active ? "#7C3AED" : "#F3F1F8"}`,
      }}
    >
      {children}
    </button>
  );
}

export default function RecruitingForm({ groupId, groupName, initial }) {
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
  const [error, setError] = useState("");

  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));
  const toggle = (k, v) => setD((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  async function save() {
    setSaving(true); setSaved(false); setError("");
    const res = await saveRecruiting(groupId, d);
    setSaving(false);
    if (res?.error) { setError(res.error); return; }
    setSaved(true); router.refresh();
  }

  return (
    <div style={{ padding: "0 24px 32px", display: "flex", flexDirection: "column" }}>
      <p style={{ marginTop: 12, fontSize: 12.5, color: "#757080", lineHeight: "18px" }}>
        Control whether people can request to join {groupName || "this group"}.
      </p>

      {/* Recruiting switch */}
      <div style={{ marginTop: 18, height: 63, background: "#F3F1F8", borderRadius: 16, position: "relative", padding: "14px 16px" }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "#1D1B44" }}>Open to join requests</p>
        <p style={{ marginTop: 6, fontSize: 10.5, color: "#59408C" }}>Anyone can request to join this group</p>
        <button
          type="button"
          role="switch"
          aria-checked={d.recruiting}
          onClick={() => set("recruiting", !d.recruiting)}
          style={{ position: "absolute", right: 16, top: 20, width: 44, height: 24, borderRadius: 12, background: d.recruiting ? "#7C3AED" : "#D9D4E0", transition: "background 120ms" }}
        >
          <span style={{ position: "absolute", top: 3, left: d.recruiting ? 23 : 3, width: 18, height: 18, borderRadius: 9999, background: "#fff", transition: "left 120ms" }} />
        </button>
      </div>

      {!d.recruiting ? (
        <div style={{ marginTop: 16, height: 140, background: "#F3F1F8", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1D1B44" }}>Not recruiting</p>
          <p style={{ marginTop: 12, fontSize: 12, color: "#757080", lineHeight: "18px" }}>
            Turn on &ldquo;Open to join requests&rdquo; to set how many members you need and let people apply.
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginTop: 30, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ maxWidth: 167, fontSize: 13, fontWeight: 600, color: "#1D1B44", lineHeight: "18px" }}>How many more members are you looking for?</p>
            <div style={{ position: "relative", width: 160, height: 52, background: "#F3F1F8", borderRadius: 14, flexShrink: 0 }}>
              <button type="button" aria-label="Fewer members" onClick={() => set("members_wanted", Math.max(0, d.members_wanted - 1))} style={{ position: "absolute", left: 8, top: 8, width: 36, height: 36, borderRadius: 18, background: "#F3F1F8", fontSize: 18, fontWeight: 700, color: "#1D1B44" }}>−</button>
              <span style={{ position: "absolute", left: 0, top: 14, width: 160, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#1D1B44" }}>{d.members_wanted}</span>
              <button type="button" aria-label="More members" onClick={() => set("members_wanted", d.members_wanted + 1)} style={{ position: "absolute", left: 116, top: 8, width: 36, height: 36, borderRadius: 18, background: "#7C3AED", fontSize: 18, fontWeight: 700, color: "#fff" }}>+</button>
            </div>
          </div>

          <p style={{ marginTop: 34, fontSize: 14, fontWeight: 700, color: "#1D1B44" }}>Who are you looking for?</p>

          <p style={{ ...LABEL, marginTop: 24 }}>SKILLS WANTED</p>
          <div style={{ marginTop: 10 }}>
            <SkillPicker selected={d.skills_wanted} onChange={(v) => set("skills_wanted", v)} />
          </div>

          <p style={{ ...LABEL, marginTop: 26 }}>INTERESTS WANTED</p>
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {INTERESTS.map((s) => <Chip key={s} active={d.interests_wanted.includes(s)} onClick={() => toggle("interests_wanted", s)}>{s}</Chip>)}
          </div>

          <p style={{ ...LABEL, marginTop: 26 }}>WORKING STYLE WANTED</p>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            {WORKING_STYLE.map((w) => (
              <div key={w.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ width: 110, fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>{w.label}</span>
                <div style={{ display: "flex", gap: 10 }}>
                  {w.options.map((o) => <Chip key={o} active={d.personality_wanted.includes(o)} onClick={() => toggle("personality_wanted", o)}>{o}</Chip>)}
                </div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 34, fontSize: 13, color: "#1D1B44" }}>
            <span style={{ fontWeight: 600 }}>What are you looking for? </span>
            <span style={{ fontWeight: 400 }}>(optional)</span>
          </p>
          <textarea
            value={d.additional_notes}
            onChange={(e) => set("additional_notes", e.target.value)}
            placeholder={'e.g. "Looking for someone comfortable with backend APIs and available ~10h/week."'}
            style={{ marginTop: 10, width: "100%", height: 110, borderRadius: 14, background: "#F3F1F8", border: "1px solid #F3F1F8", padding: 16, fontSize: 12.5, color: "#1D1B44", outline: "none", resize: "none" }}
          />

          <p style={{ marginTop: 30, fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>Joining method</p>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["approval", "Approval required", "You review each request before they join."],
              ["auto", "Auto-join", "Anyone can join instantly until the group is full."],
            ].map(([v, l, sub]) => {
              const on = d.joining_method === v;
              return (
                <button key={v} type="button" onClick={() => set("joining_method", v)} className="text-left" style={{ height: 58, borderRadius: 14, background: on ? "#ECE8FC" : "#F3F1F8", border: `1px solid ${on ? "#7C3AED" : "transparent"}`, padding: "12px 16px" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>{l}</p>
                  <p style={{ marginTop: 6, fontSize: 11, color: "#757080" }}>{sub}</p>
                </button>
              );
            })}
          </div>
        </>
      )}

      {error && <p style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: "#BF4247" }}>{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        style={{ marginTop: error ? 12 : 40, height: 56, borderRadius: 28, background: "linear-gradient(90deg,#7C3AED,#6126CC)", boxShadow: "0px 6px 18px rgba(124,58,237,0.22)", fontSize: 16, fontWeight: 600, color: "#fff", opacity: saving ? 0.5 : 1 }}
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Settings"}
      </button>
      <button type="button" onClick={() => router.back()} style={{ marginTop: 14, height: 56, borderRadius: 28, background: "#F3F1F8", fontSize: 16, fontWeight: 600, color: "#1D1B44" }}>Cancel</button>
    </div>
  );
}
