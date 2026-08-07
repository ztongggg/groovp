"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/edit-profile/actions";

const INTEREST_OPTIONS = [
  { name: "Sustainability", icon: "/interest-sustainability.svg" },
  { name: "EdTech", icon: "/interest-edtech.svg" },
  { name: "Web Dev", icon: "/interest-webdev.svg" },
  { name: "Healthcare", icon: "/interest-healthcare.svg" },
  { name: "Data Science", icon: "/interest-datascience.svg" },
  { name: "Social Impact", icon: "/interest-socialimpact.svg" },
  { name: "Robotics", icon: "/interest-robotics.svg" },
  { name: "AI & ML", icon: "/interest-aiml.svg" },
  { name: "Design", icon: "/interest-design.svg" },
];

// Own screen, own save — no longer a step inside the combined wizard.
export default function EditInterestsForm({ initial }) {
  const router = useRouter();
  const [interests, setInterests] = useState(initial || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggle = (n) => setInterests((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));

  async function save() {
    setSaving(true); setError("");
    const res = await updateProfile({ interests }, "/edit-profile");
    if (res?.error) { setError(res.error); setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-3 px-6 pb-10">
      <button type="button" onClick={() => router.push("/edit-profile")} className="mb-1 self-start" style={{ fontSize: 13, fontWeight: 700, color: "#6b6678" }}>‹ Back</button>
      <h1 className="text-[22px] font-extrabold text-navy">Edit Interests</h1>
      <p className="-mt-1 text-[13px] text-muted">Update your interests!</p>

      <div className="grid grid-cols-3 gap-x-2 gap-y-6 py-2">
        {INTEREST_OPTIONS.map(({ name, icon }) => {
          const active = interests.includes(name);
          return (
            <button key={name} type="button" onClick={() => toggle(name)} className="flex flex-col items-center gap-2">
              <span className="flex items-center justify-center rounded-full" style={{ width: 72, height: 72, background: active ? "#7c3aed" : "#f3f1f8" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon} alt="" width={28} height={28} style={{ filter: active ? "brightness(0) invert(1)" : "none" }} />
              </span>
              <span className="text-center" style={{ fontSize: 11.5, fontWeight: active ? 600 : 400, color: active ? "#1d1b44" : "#757080" }}>{name}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-3 text-[14px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}

      <button onClick={save} disabled={saving} className="mt-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[15px] font-bold text-white disabled:opacity-50">
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
