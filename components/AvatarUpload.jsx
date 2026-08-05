"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ALLOWED = ["image/jpeg", "image/png"];
const MAX_BYTES = 5 * 1024 * 1024;

// Rounded-square group/project photo picker (per this app's avatar-shape convention —
// people are circles, groups/projects are rounded-squares).
export default function AvatarUpload({ url, onChange, size = 90 }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onPick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");

    if (!ALLOWED.includes(file.type)) { setError("JPEG or PNG only."); return; }
    if (file.size > MAX_BYTES) { setError("Max 5MB."); return; }

    setUploading(true);
    const supabase = createClient();
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file);
    setUploading(false);
    if (upErr) { setError(upErr.message); return; }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    onChange(data.publicUrl);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" style={{ borderRadius: size * 0.32 }} />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ borderRadius: size * 0.32, background: "#4ac7b2" }} />
        )}
        <label className="absolute flex cursor-pointer items-center justify-center rounded-full border-2 border-white" style={{ right: -4, bottom: -4, width: 32, height: 32, background: "#7c3aed" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" /><circle cx="12" cy="13" r="4" /></svg>
          <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={onPick} disabled={uploading} />
        </label>
      </div>
      <p className="mt-2 text-[12.5px] font-semibold text-purple-600">{uploading ? "Uploading…" : "Change photo"}</p>
      {error && <p className="mt-1 text-[11px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
    </div>
  );
}
