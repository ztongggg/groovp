"use client";

import { useState, useEffect, useRef } from "react";
import { searchInviteCandidates } from "@/app/groups/[groupId]/actions";
import { inviteUserId } from "@/app/recruiting/[groupId]/actions";

const STATUS_LABEL = { invited: "Invited", pending: "Applied", accepted: "Member", declined: null };

export default function InviteMemberSearch({ groupId }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState({}); // userId -> true, optimistic
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
    const r = await inviteUserId(groupId, userId);
    if (r?.error) setInvited((s) => ({ ...s, [userId]: false }));
  }

  return (
    <div className="mt-5 flex flex-col gap-3 px-6">
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#757080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or @username" className="flex-1 bg-transparent text-[13px] text-navy focus:outline-none" />
      </div>

      {q.trim().length >= 2 && (
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-muted">Results</p>
      )}

      {loading && <p className="text-[13px] text-muted">Searching…</p>}

      <div className="flex flex-col gap-2.5">
        {results.map((c) => {
          const already = invited[c.id] || c.requestStatus === "invited" || c.requestStatus === "pending" || c.requestStatus === "accepted";
          const label = invited[c.id] ? "Invited" : STATUS_LABEL[c.requestStatus] || null;
          return (
            <div key={c.id} className="flex items-center justify-between rounded-2xl border border-line bg-white px-3 py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: "#7c3aed" }}>
                  {(c.full_name || c.username || "?").slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-[13.5px] font-bold text-navy">{c.full_name || c.username}</p>
                  <p className="text-[11px] text-muted">{[c.year, c.major, c.university].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={already}
                onClick={() => onInvite(c.id)}
                className="rounded-full px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-60"
                style={{ background: already ? "#c9c5d3" : "#7c3aed" }}
              >
                {label || "Invite"}
              </button>
            </div>
          );
        })}
        {!loading && q.trim().length >= 2 && results.length === 0 && (
          <p className="mt-2 text-center text-[13px] text-muted">No matches.</p>
        )}
      </div>
    </div>
  );
}
