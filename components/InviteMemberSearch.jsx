"use client";

import { useState, useEffect, useRef } from "react";
import { searchInviteCandidates } from "@/app/groups/[groupId]/actions";
import { inviteUserId } from "@/app/recruiting/[groupId]/actions";

const STATUS_LABEL = { invited: "Invited", pending: "Applied", accepted: "Member", declined: null };
const AVATAR = ["#f29c38", "#4ac7b2", "#f2a5bd", "#7c3aed", "#34b9a8"];

export default function InviteMemberSearch({ groupId }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState({}); // userId -> true, optimistic
  const [errors, setErrors] = useState({}); // userId -> message
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const r = await searchInviteCandidates(groupId, q);
      setLoading(false);
      setResults(r);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [q, groupId]);

  async function onInvite(userId) {
    setInvited((s) => ({ ...s, [userId]: true }));
    setErrors((s) => ({ ...s, [userId]: "" }));
    const r = await inviteUserId(groupId, userId);
    if (r?.error) {
      setInvited((s) => ({ ...s, [userId]: false }));
      setErrors((s) => ({ ...s, [userId]: r.error }));
    }
  }

  return (
    <div style={{ marginTop: 22, padding: "0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ height: 50, background: "#fff", borderRadius: 14, border: "1px solid #F3F1F8", display: "flex", alignItems: "center", gap: 12, padding: "0 16px" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#757080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or @username" className="flex-1 bg-transparent focus:outline-none" style={{ fontSize: 13, color: "#1D1B44" }} />
      </div>

      {q.trim().length >= 2 && <p style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: "#757080" }}>Results</p>}

      {loading && <p style={{ fontSize: 13, color: "#757080" }}>Searching…</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {results.map((c, i) => {
          const already = invited[c.id] || c.requestStatus === "invited" || c.requestStatus === "pending" || c.requestStatus === "accepted";
          const label = invited[c.id] ? "Invited" : STATUS_LABEL[c.requestStatus] || null;
          return (
            <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ height: 66, background: "#fff", borderRadius: 16, border: "1px solid #F3F1F8", display: "flex", alignItems: "center", gap: 10, padding: "0 10px" }}>
              {c.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.avatar_url} alt="" style={{ width: 46, height: 46, borderRadius: 9999, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <span style={{ position: "relative", width: 46, height: 46, borderRadius: 9999, background: AVATAR[i % AVATAR.length], flexShrink: 0, display: "block" }}>
                  <span style={{ position: "absolute", left: 13.1, top: 21.5, width: 5.1, height: 5.1, borderRadius: 9999, background: "#fff" }} />
                  <span style={{ position: "absolute", left: 27.8, top: 21.5, width: 5.1, height: 5.1, borderRadius: 9999, background: "#fff" }} />
                  <span style={{ position: "absolute", left: 19.2, top: 29.6, width: 7.6, height: 2.5, borderRadius: 1.3, background: "#fff" }} />
                </span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#1D1B44", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.full_name || c.username}</p>
                <p style={{ fontSize: 11, color: "#757080", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{[c.year, c.major, c.university].filter(Boolean).join(" · ")}</p>
              </div>
              <button
                type="button"
                disabled={already}
                onClick={() => onInvite(c.id)}
                style={{ width: 78, height: 36, borderRadius: 18, background: already ? "#C9C5D3" : "#7C3AED", color: "#fff", fontSize: 12, fontWeight: 600, flexShrink: 0 }}
              >
                {label || "Invite"}
              </button>
            </div>
            {errors[c.id] && <p style={{ paddingLeft: 10, fontSize: 11.5, fontWeight: 600, color: "#BF4247" }}>{errors[c.id]}</p>}
            </div>
          );
        })}
        {!loading && q.trim().length >= 2 && results.length === 0 && (
          <p style={{ marginTop: 8, textAlign: "center", fontSize: 13, color: "#757080" }}>No matches.</p>
        )}
      </div>
    </div>
  );
}
