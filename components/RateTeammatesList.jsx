"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitRating } from "@/app/rate/actions";

function StarRow({ name, stars, hover, onHover, onSet }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onMouseEnter={() => onHover(n)} onMouseLeave={() => onHover(0)} onClick={() => onSet(n)} style={{ fontSize: 20, lineHeight: 1, color: (hover || stars) >= n ? "#f5b301" : "#d6d3de" }}>★</button>
      ))}
    </div>
  );
}

const AVATAR = ["#f29c38", "#f2a5bd", "#4ac7b2", "#7c3aed", "#34b9a8"];

// Shared "rate each of these teammates" list — used by both the leader's
// End Project flow and the standalone Rate page any ended-group member can
// reach (e.g. from a rate_reminder notification), so there's one place this
// UI lives instead of drifting copies. Single "Submit Ratings" commits every
// rated teammate at once, matching spec (was one submit button per teammate).
export default function RateTeammatesList({ members, projectId, onDone }) {
  const router = useRouter();
  const [entries, setEntries] = useState(() => Object.fromEntries(members.map((m) => [m.userId, { stars: 0, hover: 0, comment: "" }])));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!members.length) {
    return <p className="text-center text-[14px] text-muted">No other teammates to rate in this group.</p>;
  }

  const set = (id, patch) => setEntries((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  async function submitAll() {
    setSaving(true); setError("");
    const rated = members.filter((m) => entries[m.userId].stars > 0);
    for (const m of rated) {
      const e = entries[m.userId];
      const res = await submitRating(m.userId, projectId, e.stars, e.comment);
      if (res?.error) { setError(res.error); setSaving(false); return; }
    }
    setSaving(false);
    router.refresh();
    onDone?.();
  }

  return (
    <div className="flex flex-col gap-3">
      {members.map((m, i) => {
        const e = entries[m.userId];
        return (
          <div key={m.userId} className="rounded-2xl bg-white p-4" style={{ boxShadow: "0px 2px 8px rgba(26,20,51,0.06)" }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: AVATAR[i % AVATAR.length] }}>
                  {(m.name || "?").slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-[14px] font-bold text-navy">{m.name}</p>
                  <p className="text-[12px] text-muted">Member</p>
                </div>
              </div>
              <StarRow stars={e.stars} hover={e.hover} onHover={(n) => set(m.userId, { hover: n })} onSet={(n) => set(m.userId, { stars: n })} />
            </div>
            <input value={e.comment} onChange={(ev) => set(m.userId, { comment: ev.target.value })} placeholder="Add a comment (optional)" className="mt-3 w-full rounded-xl px-3 py-2.5 text-[13px] text-navy focus:outline-none" style={{ background: "#f3f1f8" }} />
          </div>
        );
      })}

      {error && <p className="text-[13px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}

      <button onClick={submitAll} disabled={saving} className="mt-1 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-3.5 text-[15px] font-bold text-white disabled:opacity-50">
        {saving ? "Saving…" : "Submit Ratings"}
      </button>
    </div>
  );
}
