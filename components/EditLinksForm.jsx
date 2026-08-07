"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/edit-profile/actions";

const PROJECT_TINTS = ["#4AC7B2", "#B1B4ED", "#C4B5FD", "#F2A5BD"];
// Behance and the generic "+ Add another link" row in the Figma frame have no
// backing column, so they are deliberately not rendered — an inert field here
// would look saved and never be.
const LINK_FIELDS = [
  { key: "linkedin_url", label: "LinkedIn", glyph: "in", bg: "#086BAD", placeholder: "linkedin.com/in/username" },
  { key: "github_url", label: "GitHub", glyph: "GH", bg: "#141414", placeholder: "github.com/username" },
  { key: "portfolio_url", label: "Portfolio Website", glyph: "🌐", bg: "#7C3AED", placeholder: "yourname.dev" },
];

// Own screen, own save — no longer a step inside the combined wizard.
export default function EditLinksForm({ initial, pastProjects = [] }) {
  const router = useRouter();
  const [d, setD] = useState({
    linkedin_url: initial.linkedin_url || "",
    github_url: initial.github_url || "",
    portfolio_url: initial.portfolio_url || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setD((s) => ({ ...s, [k]: v }));

  async function save() {
    setSaving(true); setError("");
    const res = await updateProfile(d, "/edit-profile");
    if (res?.error) { setError(res.error); setSaving(false); }
  }

  return (
    <div className="flex flex-col gap-3 px-6 pb-10">
      <button type="button" onClick={() => router.push("/edit-profile")} className="mb-1 self-start" style={{ fontSize: 13, fontWeight: 700, color: "#6b6678" }}>‹ Back</button>
      <h1 className="text-[22px] font-extrabold text-navy">Projects & Links</h1>
      <p className="-mt-1 text-[13px] text-muted">Show teammates your work outside Groovp.</p>

      <p style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: "#757080" }}>Projects</p>
      {pastProjects.map((pp, i) => (
        <Link key={pp.id} href={`/past-projects/${pp.id}`} style={{ height: 72, background: "#fff", borderRadius: 16, border: "1px solid #F3F1F8", boxShadow: "0px 2px 10px rgba(25,20,51,0.05)", display: "flex", alignItems: "center", gap: 10, padding: 10 }}>
          <span style={{ position: "relative", width: 52, height: 52, borderRadius: 12, background: PROJECT_TINTS[i % PROJECT_TINTS.length], flexShrink: 0, display: "block" }}>
            <span style={{ position: "absolute", left: 16.5, top: 23.5, width: 5, height: 5, borderRadius: 9999, background: "#fff" }} />
            <span style={{ position: "absolute", left: 30.5, top: 23.5, width: 5, height: 5, borderRadius: 9999, background: "#fff" }} />
            <span style={{ position: "absolute", left: 22.3, top: 31.5, width: 7.5, height: 2.5, borderRadius: 1.3, background: "#fff" }} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "#1D1B44", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pp.name}</span>
            <span style={{ display: "block", fontSize: 11, color: "#757080", marginTop: 4 }}>{pp.subtitle}</span>
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6126CC", flexShrink: 0 }}>View ›</span>
        </Link>
      ))}
      <Link href="/past-projects/add" style={{ height: 48, borderRadius: 14, background: "#fff", border: "1.5px solid #7C3AED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#7C3AED" }}>+ Add Project</Link>

      <p style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "#757080" }}>Links</p>
      {LINK_FIELDS.map((f) => (
        <div key={f.key} style={{ height: 64, background: "#fff", borderRadius: 16, border: "1px solid #F3F1F8", display: "flex", alignItems: "center", gap: 12, padding: "0 14px" }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: f.bg, color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.glyph}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#757080" }}>{f.label}</p>
            <input
              className="w-full bg-transparent focus:outline-none"
              style={{ fontSize: 13, color: "#1D1B44" }}
              placeholder={f.placeholder}
              value={d[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
            />
          </div>
        </div>
      ))}

      {error && <p className="mt-3 text-[14px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}

      <button onClick={save} disabled={saving} className="mt-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[15px] font-bold text-white disabled:opacity-50">
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
