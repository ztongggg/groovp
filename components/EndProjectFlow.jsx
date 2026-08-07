"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RateTeammatesList from "@/components/RateTeammatesList";
import { endProject } from "@/app/groups/[groupId]/actions";
import { addPastProjectForProject } from "@/app/groups/[groupId]/end/actions";
import { createClient } from "@/lib/supabase/client";

function PhotoPicker({ photos, onChange }) {
  const [uploading, setUploading] = useState(false);

  async function onPick(e, i) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !["image/jpeg", "image/png"].includes(file.type)) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("project-resources").upload(path, file);
    setUploading(false);
    if (error) return;
    const { data } = supabase.storage.from("project-resources").getPublicUrl(path);
    const next = [...photos];
    next[i] = data.publicUrl;
    onChange(next.filter(Boolean));
  }

  return (
    <div style={{ display: "flex", gap: 12 }}>
      {[0, 1, 2].map((i) => (
        <label key={i} style={{ width: 104, height: 90, borderRadius: 14, background: "#F3F1F8", border: "1px solid #CCC2F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          {photos[i] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos[i]} alt="" style={{ width: "100%", height: "100%", borderRadius: 14, objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 24, fontWeight: 400, color: "#7C3AED" }}>{uploading ? "…" : "+"}</span>
          )}
          <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => onPick(e, i)} disabled={uploading} />
        </label>
      ))}
    </div>
  );
}

export default function EndProjectFlow({ groupId, groupName, groupStatus, projectId, members }) {
  const router = useRouter();
  const [step, setStep] = useState(groupStatus === "Ended" ? "rate" : "confirm");
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [writeUp, setWriteUp] = useState("");
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState(false);

  async function onConfirmEnd() {
    setEnding(true); setError("");
    const r = await endProject(groupId);
    setEnding(false);
    if (r?.error) { setError(r.error); return; }
    setStep(members.length > 0 ? "rate" : "addProject");
  }

  async function onAddProject() {
    setSaving(true); setError("");
    const r = await addPastProjectForProject(projectId, role, writeUp, photos);
    setSaving(false);
    if (r?.error) { setError(r.error); return; }
    setAdded(true);
  }

  // End Project Confirmation is a centred modal over a dimmed screen, not a page.
  if (step === "confirm") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.40)" }}>
        <div style={{ width: 354, background: "#fff", borderRadius: 24, boxShadow: "0px 8px 30px rgba(25,20,51,0.18)", padding: "28px 24px 24px", textAlign: "center" }}>
          <span style={{ width: 64, height: 64, borderRadius: 9999, background: "#D44D52", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" /></svg>
          </span>
          <p style={{ marginTop: 20, fontSize: 19, fontWeight: 800, color: "#1D1B44" }}>End this project?</p>
          <p style={{ marginTop: 14, fontSize: 12, color: "#757080", lineHeight: "18px" }}>
            This will close the Group chat<br />
            {groupName && <span style={{ fontWeight: 700 }}>&ldquo;{groupName}&rdquo;.</span>}
            {" "}Members will be prompted to rate each other, and the group chat will be archived.
          </p>
          {error && <p style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: "#bf4247" }}>{error}</p>}
          <button onClick={onConfirmEnd} disabled={ending} style={{ marginTop: 24, width: "100%", height: 52, borderRadius: 26, background: "#FAE0E0", color: "#BF4247", fontSize: 13.5, fontWeight: 600 }}>
            {ending ? "Ending…" : "Yes, End Project"}
          </button>
          <button onClick={() => router.back()} style={{ marginTop: 6, width: "100%", height: 48, borderRadius: 24, background: "#F3F1F8", color: "#1D1B44", fontSize: 13, fontWeight: 600 }}>Cancel</button>
        </div>
      </div>
    );
  }

  if (step === "rate") {
    return (
      <div style={{ marginTop: 24, padding: "0 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#1D1B44" }}>Rate your teammates</p>
          <p style={{ marginTop: 12, fontSize: 12.5, color: "#757080", lineHeight: "18px" }}>
            {groupName ? `“${groupName}” has ended.` : "This project has ended."} Leave a rating for each teammate.
          </p>
        </div>
        <RateTeammatesList members={members} projectId={projectId} onDone={() => setStep("addProject")} />
      </div>
    );
  }

  if (step === "addProject") {
    if (added) {
      return (
        <div className="mt-16 flex flex-col items-center px-8 text-center">
          <p className="text-[20px] font-extrabold text-navy">All done ✓</p>
          <p className="mt-2 text-[14px] text-muted">Added to your profile.</p>
          <button onClick={() => router.push("/profile")} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-3.5 text-[15px] font-bold text-white">Go to profile</button>
        </div>
      );
    }
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 24px" }}>
          <button onClick={() => setStep("rate")} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }}>‹</button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1D1B44" }}>Add this to your profile?</h1>
        </div>
      <div style={{ padding: "0 24px 32px" }}>
        <p style={{ marginTop: 12, fontSize: 12.5, color: "#757080", lineHeight: "18px" }}>
          Show off what you built{groupName ? ` on “${groupName}”` : ""} — write a short summary and add a few photos.
        </p>

        {groupName && (
          <div style={{ marginTop: 21, height: 52, background: "#F3F1F8", borderRadius: 14, display: "flex", alignItems: "center", padding: "0 16px" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1D1B44" }}>{groupName}</span>
          </div>
        )}

        <p style={{ marginTop: 15, fontSize: 12, fontWeight: 600, color: "#757080" }}>Your role</p>
        <input
          placeholder="e.g. Frontend Lead"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginTop: 6, width: "100%", height: 50, borderRadius: 14, background: "#F3F1F8", padding: "0 16px", fontSize: 13.5, color: "#1D1B44", outline: "none" }}
        />

        <p style={{ marginTop: 15, fontSize: 12, fontWeight: 600, color: "#757080" }}>Write-up</p>
        <textarea
          placeholder="What did you build? What are you proud of? (visible on your public profile)"
          value={writeUp}
          onChange={(e) => setWriteUp(e.target.value)}
          rows={4}
          style={{ marginTop: 6, width: "100%", height: 140, borderRadius: 14, background: "#F3F1F8", border: "1px solid #F3F1F8", padding: 16, fontSize: 12.5, color: "#1D1B44", outline: "none", resize: "none" }}
        />

        <p style={{ marginTop: 15, fontSize: 12, fontWeight: 600, color: "#757080" }}>Photos (optional)</p>
        <div style={{ marginTop: 6 }}>
          <PhotoPicker photos={photos} onChange={setPhotos} />
        </div>

        {error && <p style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: "#bf4247" }}>{error}</p>}

        <button
          onClick={onAddProject}
          disabled={saving}
          style={{ marginTop: 24, width: "100%", height: 56, borderRadius: 28, background: "linear-gradient(90deg,#7C3AED,#6126CC)", boxShadow: "0px 6px 18px rgba(124,58,237,0.22)", fontSize: 16, fontWeight: 600, color: "#fff", opacity: saving ? 0.5 : 1 }}
        >
          {saving ? "Adding…" : "Add to Profile"}
        </button>
        <button onClick={() => router.push("/profile")} style={{ marginTop: 10, width: "100%", height: 44, borderRadius: 22, background: "#F3F1F8", fontSize: 12.5, fontWeight: 600, color: "#1D1B44" }}>Skip for now</button>
      </div>
      </div>
    );
  }

  return null;
}
