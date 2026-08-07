"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ConnectLinkedIn({ verified }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function connect() {
    setLoading(true);
    setErr("");
    const supabase = createClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: "linkedin_oidc",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/profile` },
    });
    // On success the browser redirects to LinkedIn; we only reach here on error.
    if (error) {
      setErr(error.message);
      setLoading(false);
    }
  }

  if (verified) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4">
        <span className="flex items-center gap-2 text-[15px] font-semibold text-navy">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a66c2"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" /></svg>
          LinkedIn verified
        </span>
        <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "#d4f2de", color: "#298c52" }}>✓ Verified</span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={connect}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-[15px] font-bold text-white disabled:opacity-60"
        style={{ background: "#0a66c2" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" /></svg>
        {loading ? "Redirecting…" : "Verify with LinkedIn"}
      </button>
      {err && <p className="mt-2 text-[12px] font-semibold text-[#bf4247]">{err}</p>}
    </div>
  );
}
