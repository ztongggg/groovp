"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitRating } from "@/app/rate/actions";

function StarRow({ stars, hover, onHover, onSet }) {
  const on = hover || stars;
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" aria-label={`${n} star${n === 1 ? "" : "s"}`} onMouseEnter={() => onHover(n)} onMouseLeave={() => onHover(0)} onClick={() => onSet(n)} style={{ lineHeight: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={on >= n ? "#FFD84D" : "none"} stroke={on >= n ? "#FFD84D" : "#F3F1F8"} strokeWidth="2" strokeLinejoin="round">
            <path d="m12 3.5 2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.8l6-.7L12 3.5Z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

const AVATAR = ["#F29C38", "#F2A5BD", "#4AC7B2", "#A78BFA", "#9496F4"];

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
  // Inside End Project the parent advances the flow; standalone, both
  // "Submit Ratings" and "Skip for now" land back on Teams.
  const finish = () => (onDone ? onDone() : router.push("/teams"));

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
    finish();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {members.map((m, i) => {
        const e = entries[m.userId];
        return (
          <div key={m.userId} style={{ background: "#fff", borderRadius: 18, border: "1px solid #F3F1F8", boxShadow: "0px 2px 10px rgba(25,20,51,0.05)", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {m.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.avatarUrl} alt="" style={{ width: 50, height: 50, borderRadius: 9999, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <span style={{ position: "relative", width: 50, height: 50, borderRadius: 9999, background: AVATAR[i % AVATAR.length], flexShrink: 0, display: "block" }}>
                  <span style={{ position: "absolute", left: 9.1, top: 19.3, width: 6.8, height: 6.8, borderRadius: 9999, background: "#fff" }} />
                  <span style={{ position: "absolute", left: 34.1, top: 19.3, width: 6.8, height: 6.8, borderRadius: 9999, background: "#fff" }} />
                  <span style={{ position: "absolute", left: 18.2, top: 29.6, width: 13.6, height: 3.4, borderRadius: 9999, background: "#fff" }} />
                </span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1D1B44" }}>{m.name}</p>
                <p style={{ fontSize: 11.5, color: "#757080", marginTop: 4 }}>{m.role === "leader" ? "Group Leader" : "Member"}</p>
              </div>
              <StarRow stars={e.stars} hover={e.hover} onHover={(n) => set(m.userId, { hover: n })} onSet={(n) => set(m.userId, { stars: n })} />
            </div>
            <input
              value={e.comment}
              onChange={(ev) => set(m.userId, { comment: ev.target.value })}
              placeholder="Add a comment (optional)"
              style={{ marginTop: 12, width: "100%", height: 44, borderRadius: 12, background: "#F3F1F8", padding: "0 12px", fontSize: 11.5, color: "#1D1B44", outline: "none" }}
            />
          </div>
        );
      })}

      {error && <p style={{ fontSize: 13, fontWeight: 500, color: "#bf4247" }}>{error}</p>}

      <button
        onClick={submitAll}
        disabled={saving}
        style={{ marginTop: 6, width: "100%", height: 56, borderRadius: 28, background: "linear-gradient(90deg, #7C3AED 0%, #6126CC 100%)", boxShadow: "0px 6px 18px rgba(124,58,237,0.22)", fontSize: 16, fontWeight: 600, color: "#fff", opacity: saving ? 0.5 : 1 }}
      >
        {saving ? "Saving…" : "Submit Ratings"}
      </button>
      <button onClick={finish} style={{ width: "100%", height: 44, borderRadius: 22, background: "#F3F1F8", fontSize: 12.5, fontWeight: 600, color: "#1D1B44" }}>
        Skip for now
      </button>
    </div>
  );
}
