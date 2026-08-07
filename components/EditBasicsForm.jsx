"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/edit-profile/actions";
import AvatarUpload from "@/components/AvatarUpload";

const YEARS = ["Y1", "Y2", "Y3", "Y4", "Other"];
const PERSONALITY = [
  { key: "personality", label: "Personality", options: ["Introvert", "Extrovert"] },
  { key: "prefer_working", label: "Prefer Working", options: ["Online", "Face-to-face"] },
  { key: "best_work_time", label: "Best Work Time", options: ["In the day time", "At night"] },
];
const LOCATIONS = ["North", "South", "East", "West", "On Campus", "Central"];

const cls = "rounded-2xl bg-[#f3f1f8] px-4 py-3.5 text-[15px] text-navy focus:outline-none w-full";

function Chip({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className="rounded-full px-4 py-2 text-[13px] font-semibold" style={{ background: active ? "#fff" : "#f3f1f8", color: active ? "#7c3aed" : "#1d1b44", border: active ? "1px solid #7c3aed" : "1px solid transparent" }}>{children}</button>;
}

function SummaryRow({ href, label }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-2xl bg-[#f7f6fa] px-4 py-3.5">
      <span className="text-[14px] font-bold text-navy">{label}</span>
      <span className="text-[13px] font-semibold text-purple-600">›</span>
    </Link>
  );
}

// Basic Info — the Edit Profile hub. Skills / Interests / Links each moved to
// their own screen with their own save (spec: reached via summary rows, not
// one shared wizard) — these 3 rows are how you get to them.
export default function EditBasicsForm({ initial }) {
  const router = useRouter();
  const [d, setD] = useState({
    full_name: initial.full_name || "",
    username: initial.username || "",
    avatar_url: initial.avatar_url || "",
    bio: initial.bio || "",
    university: initial.university || "",
    major: initial.major || "",
    year: initial.year || "",
    personality: initial.personality || "",
    prefer_working: initial.prefer_working || "",
    best_work_time: initial.best_work_time || "",
    location: initial.location || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));

  async function save() {
    setSaving(true); setError("");
    const res = await updateProfile(d);
    if (res?.error) { setError(res.error); setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-3 px-6 pb-10">
      <button type="button" onClick={() => router.push("/profile")} className="mb-1 self-start" style={{ fontSize: 13, fontWeight: 700, color: "#6b6678" }}>‹ Back</button>
      <h1 className="text-[22px] font-extrabold text-navy">Edit Profile</h1>
      <p className="-mt-1 text-[13px] text-muted">Update how teammates see you.</p>

      <div className="my-2 flex justify-center">
        <AvatarUpload url={d.avatar_url} onChange={(u) => set("avatar_url", u)} size={96} round />
      </div>
      <input className={cls} placeholder="Full name" value={d.full_name} onChange={(e) => set("full_name", e.target.value)} />
      <input className={cls} placeholder="Username" value={d.username} onChange={(e) => set("username", e.target.value)} />
      <textarea className={cls} rows={3} placeholder="Short bio — what are you into?" value={d.bio} onChange={(e) => set("bio", e.target.value)} />
      <input className={cls} placeholder="University" value={d.university} onChange={(e) => set("university", e.target.value)} />
      <input className={cls} placeholder="Major" value={d.major} onChange={(e) => set("major", e.target.value)} />

      <p className="mt-2 text-[14px] font-bold text-navy">Year of study</p>
      <div className="flex flex-wrap gap-2">{YEARS.map((y) => <Chip key={y} active={d.year === y} onClick={() => set("year", y)}>{y}</Chip>)}</div>

      <p className="mt-3 text-[16px] font-extrabold text-navy">Working Style</p>
      <p className="-mt-2 text-[12px] text-muted">For each, pick how you work.</p>
      {PERSONALITY.map((p) => (
        <div key={p.key} className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-navy">{p.label}</span>
          <div className="flex gap-2">{p.options.map((o) => <Chip key={o} active={d[p.key] === o} onClick={() => set(p.key, o)}>{o}</Chip>)}</div>
        </div>
      ))}

      <p className="mt-3 text-[16px] font-extrabold text-navy">Place of Stay</p>
      <div className="flex flex-wrap gap-2">
        {LOCATIONS.map((loc) => (
          <Chip key={loc} active={d.location === loc} onClick={() => set("location", loc)}>{loc === "On Campus" ? "Campus" : loc}</Chip>
        ))}
      </div>

      {error && <p className="mt-3 text-[14px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}

      <button onClick={save} disabled={saving} className="mt-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[15px] font-bold text-white disabled:opacity-50">
        {saving ? "Saving…" : "Save Changes"}
      </button>

      <div className="mt-5 flex flex-col gap-2.5">
        <SummaryRow href="/edit-profile/skills" label="Edit Skills" />
        <SummaryRow href="/edit-profile/interests" label="Edit Interests" />
        <SummaryRow href="/edit-profile/links" label="Projects & Links" />
      </div>
    </div>
  );
}
