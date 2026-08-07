"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/edit-profile/actions";
import SkillPicker from "@/components/SkillPicker";

// Own screen, own save — no longer a step inside the combined wizard.
export default function EditSkillsForm({ initial }) {
  const router = useRouter();
  const [skills, setSkills] = useState(initial || []); // [{ name, level }]
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setSkillLevel = (n, level) => setSkills((s) => s.map((x) => (x.name === n ? { ...x, level } : x)));

  async function save() {
    setSaving(true); setError("");
    const res = await updateProfile({ skills }, "/edit-profile");
    if (res?.error) { setError(res.error); setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-3 px-6 pb-10">
      <button type="button" onClick={() => router.push("/edit-profile")} className="mb-1 self-start" style={{ fontSize: 13, fontWeight: 700, color: "#6b6678" }}>‹ Back</button>
      <h1 className="text-[22px] font-extrabold text-navy">Edit Skills</h1>
      <p className="-mt-1 text-[13px] text-muted">Update your skills!</p>

      <SkillPicker
        selected={skills.map((s) => s.name)}
        onChange={(names) => setSkills((s) => names.map((n) => s.find((x) => x.name === n) || { name: n, level: "Basic" }))}
      />
      {skills.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-[15px] font-bold text-navy">Set your skill level</p>
          <p className="-mt-1.5 text-[11.5px] text-muted">For each skill, pick how confident you are.</p>
          {skills.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-xl bg-[#f7f6fa] px-3 py-2">
              <span className="text-[13px] font-semibold text-navy">{s.name}</span>
              <div className="flex gap-1.5">
                {["Basic", "Good", "Expert"].map((lv) => (
                  <button key={lv} type="button" onClick={() => setSkillLevel(s.name, lv)} className="rounded-md px-2.5 py-1 text-[11px] font-bold" style={{ background: s.level === lv ? "#fff" : "transparent", color: s.level === lv ? "#7c3aed" : "#757080", border: s.level === lv ? "1px solid #7c3aed" : "1px solid transparent" }}>{lv}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-[14px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}

      <button onClick={save} disabled={saving} className="mt-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[15px] font-bold text-white disabled:opacity-50">
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
