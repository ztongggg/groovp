"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ALLOWED = ["image/jpeg", "image/png", "application/pdf", "video/mp4"];
const MAX_BYTES = 50 * 1024 * 1024;

export default function ResourceFileUpload({ files = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onPick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");

    if (!ALLOWED.includes(file.type)) {
      setError("Only JPEG, PNG, PDF, and MP4 files are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Files must be 50MB or smaller.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("project-resources").upload(path, file);
    setUploading(false);
    if (upErr) { setError(upErr.message); return; }

    const { data } = supabase.storage.from("project-resources").getPublicUrl(path);
    onChange([...files, { url: data.publicUrl, name: file.name }]);
  }

  function remove(url) {
    onChange(files.filter((f) => f.url !== url));
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center rounded-2xl border-[1.5px] border-dashed py-4 text-[13px] font-semibold" style={{ borderColor: "#7c3aed", color: "#7c3aed" }}>
        {uploading ? "Uploading…" : "+ Upload a file"}
        <input type="file" accept=".jpg,.jpeg,.png,.pdf,.mp4" className="hidden" onChange={onPick} disabled={uploading} />
      </label>
      <p className="mt-1.5 text-[11px] text-muted">JPEG, PNG, PDF, and MP4 formats, up to 50 MB.</p>
      {error && <p className="mt-1.5 text-[12px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
      {files.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5">
          {files.map((f) => (
            <div key={f.url} className="flex items-center justify-between rounded-xl bg-[#f3f1f8] px-3 py-2">
              <span className="truncate text-[12.5px] font-semibold text-navy">{f.name}</span>
              <button type="button" onClick={() => remove(f.url)} className="shrink-0 text-[11px] font-bold" style={{ color: "#bf4247" }}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
