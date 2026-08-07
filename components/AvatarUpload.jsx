"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ALLOWED = ["image/jpeg", "image/png"];
const MAX_BYTES = 5 * 1024 * 1024;

// Photo picker. Defaults to the rounded-square group/project shape; pass
// round for a person (this app's convention: people are circles,
// groups/projects are rounded-squares).
export default function AvatarUpload({ url, onChange, size = 90, round = false, outline = false, caption = "Change photo" }) {
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

  const radius = round ? 9999 : size * 0.32;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" style={{ borderRadius: radius }} />
        ) : outline ? (
          // Empty-state treatment used when creating something that has no
          // photo yet: lavender well with a purple upload glyph.
          <div className="flex h-full w-full items-center justify-center" style={{ borderRadius: 20, background: "#F5F0FF", border: "2px solid #7C3AED" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /><path d="M12 3v12M8 7l4-4 4 4" /></svg>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ borderRadius: radius, background: round ? "#FBBF24" : "#4ac7b2" }} />
        )}
        <label className="absolute flex cursor-pointer items-center justify-center rounded-full border-2 border-white" style={{ right: -4, bottom: -4, width: 32, height: 32, background: "#7c3aed" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" /><circle cx="12" cy="13" r="4" /></svg>
          <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={onPick} disabled={uploading} />
        </label>
      </div>
      <p className="mt-2 text-[12.5px] font-semibold text-purple-600">{uploading ? "Uploading…" : caption}</p>
      {error && <p className="mt-1 text-[11px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
    </div>
  );
}
