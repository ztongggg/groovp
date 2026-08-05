"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ALLOWED = ["image/jpeg", "image/png"];
const MAX_BYTES = 5 * 1024 * 1024;

// Wide project banner (spec's `cover_image` — separate field from the rounded-square
// `photo`). Shown on Discover/Home cards and the Project Details header.
export default function CoverImageUpload({ url, onChange }) {
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
    const { error: upErr } = await supabase.storage.from("project-covers").upload(path, file);
    setUploading(false);
    if (upErr) { setError(upErr.message); return; }

    const { data } = supabase.storage.from("project-covers").getPublicUrl(path);
    onChange(data.publicUrl);
  }

  return (
    <div>
      <label className="relative flex cursor-pointer items-center justify-center overflow-hidden" style={{ width: "100%", height: 130, borderRadius: 16, background: "#d9d9d9" }}>
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <span className="relative rounded-full px-4 py-2 text-[12.5px] font-semibold text-white" style={{ background: "rgba(29,27,68,0.7)" }}>
          {uploading ? "Uploading…" : url ? "Change cover" : "+ Add cover photo"}
        </span>
        <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={onPick} disabled={uploading} />
      </label>
      {error && <p className="mt-1.5 text-[11px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
    </div>
  );
}
