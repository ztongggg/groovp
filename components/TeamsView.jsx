"use client";

import { useState } from "react";
import Link from "next/link";

const ROW_H = 76;
const ROW_GAP = 8;
const COLORS = ["#4ac7b2", "#f29c38", "#b1b4ed", "#f2a5bd"];

// Figma draws inbox avatars as a 50px tile with a face: rounded-square for a
// group, circle for a person.
function AvatarTile({ color, photoUrl, round, muted, size = 50 }) {
  const radius = round ? size / 2 : size === 50 ? 16 : 14;
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover" }} />;
  }
  const k = size / 50;
  return (
    <div className="relative" style={{ width: size, height: size, borderRadius: radius, background: muted ? "#bfbac7" : color }}>
      <span className="absolute rounded-full" style={{ left: 9 * k, top: 18 * k, width: 7 * k, height: 7 * k, background: muted ? "#111827" : "#fff" }} />
      <span className="absolute rounded-full" style={{ left: 34 * k, top: 18 * k, width: 7 * k, height: 7 * k, background: muted ? "#111827" : "#fff" }} />
      <span className="absolute" style={{ left: 18 * k, top: 28 * k, width: 14 * k, height: 3 * k, borderRadius: 45.61, background: muted ? "#be185d" : "#fff" }} />
    </div>
  );
}

const STATUS = {
  pending: { label: "Pending", bg: "#fce5b8", color: "#99730d" },
  accepted: { label: "Accepted", bg: "#d4f2de", color: "#298c52" },
  declined: { label: "Declined", bg: "#fae0e0", color: "#bf4247" },
};

const ROW_STYLE = {
  width: 354,
  height: ROW_H,
  borderRadius: 18,
  background: "#fff",
  outline: "1px solid #f3f1f8",
  boxShadow: "0px 2px 8px rgba(25.5,20.4,51,0.06)",
};

function RequestRow({ color, title, subtitle, applied, status, photoUrl }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <div className="relative" style={{ ...ROW_STYLE, height: 92 }}>
      <div className="absolute" style={{ left: 16, top: 22 }}>
        <AvatarTile color={color} photoUrl={photoUrl} size={48} />
      </div>
      <div className="absolute truncate" style={{ left: 76, top: 16, width: 180, fontSize: 13.5, fontWeight: 700, color: "#1d1b44" }}>{title}</div>
      <div className="absolute truncate" style={{ left: 76, top: 36, width: 180, fontSize: 11, fontWeight: 400, color: "#757080" }}>{subtitle}</div>
      <div className="absolute" style={{ left: 76, top: 56, fontSize: 10, fontWeight: 400, color: "#757080" }}>{applied}</div>
      <div className="absolute flex items-center justify-center" style={{ right: 18, top: 33, height: 26, minWidth: 73, padding: "0 15px", borderRadius: 13, background: s.bg }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
      </div>
    </div>
  );
}

function TeamRow({ color, title, subtitle, href, photoUrl, time, unread = 0, ended, round }) {
  return (
    <Link href={href} className="relative block" style={{ ...ROW_STYLE, background: ended ? "#f7f6f9" : "#fff", boxShadow: ended ? "none" : ROW_STYLE.boxShadow }}>
      <div className="absolute" style={{ left: 13, top: 13 }}>
        <AvatarTile color={color} photoUrl={photoUrl} round={round} muted={ended} />
      </div>
      <div className="absolute truncate" style={{ left: 74, top: 16, width: ended ? 165 : 210, fontSize: 14, fontWeight: 700, color: ended ? "#8c8794" : "#1d1b44" }}>{title}</div>
      <div className="absolute truncate" style={{ left: 74, top: 38, width: 210, fontSize: 11.5, fontWeight: 400, color: ended ? "#9e99a6" : "#757080" }}>{subtitle}</div>
      <div className="absolute text-right" style={{ left: 290, top: 16, width: 50, fontSize: 10.5, fontWeight: 400, color: ended ? "#9e99a6" : "#757080" }}>{time}</div>
      {ended && (
        <div className="absolute flex items-center justify-center" style={{ left: 245, top: 15, width: 56, height: 22, borderRadius: 11, background: "#e5e3eb" }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: "#807a87" }}>Ended</span>
        </div>
      )}
      {unread > 0 && (
        <div className="absolute flex items-center justify-center rounded-full" style={{ left: 6, top: 38, width: 22, height: 22, background: "#f43f5e" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", lineHeight: "16.5px" }}>{unread}</span>
        </div>
      )}
    </Link>
  );
}

export default function TeamsView({ requests = [], teams = [] }) {
  const [tab, setTab] = useState("my");
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const matches = (t) => !query || [t.title, t.subtitle].join(" ").toLowerCase().includes(query);
  const filteredRequests = requests.filter(matches);
  const filteredTeams = teams.filter(matches);

  const list = tab === "requested" ? filteredRequests : filteredTeams;
  const total = tab === "requested" ? requests.length : teams.length;

  return (
    <div className="relative w-[402px] pb-6" style={{ minHeight: 794, background: "#f9f8fb" }}>
      {/* Search is its own screen state in Figma: the title and tabs give way to
          a back button, an inline field, and a result count. */}
      {searchOpen ? (
        <>
          <button
            onClick={() => { setSearchOpen(false); setQ(""); }}
            aria-label="Close search"
            className="absolute flex items-center justify-center"
            style={{ left: 24, top: 48, width: 40, height: 40, borderRadius: 20, background: "#fff" }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span>
          </button>
          <div className="absolute flex items-center" style={{ left: 80, top: 48, width: 310, height: 44, borderRadius: 22, background: "#f3f1f8", paddingLeft: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages" className="ml-2 w-full bg-transparent focus:outline-none" style={{ fontSize: 13, fontWeight: 600, color: "#1d1b44" }} />
          </div>
          <div className="absolute" style={{ left: 24, top: 112, fontSize: 12, fontWeight: 600, color: "#757080" }}>
            {list.length} result{list.length === 1 ? "" : "s"}
          </div>
        </>
      ) : (
        <>
          <div className="absolute" style={{ left: 24, top: 48, fontSize: 26, fontWeight: 800, color: "#1d1b44" }}>Messages</div>

          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search messages"
            className="absolute flex items-center justify-center"
            style={{ left: 334, top: 44, width: 44, height: 44, borderRadius: 22, background: "#f3f1f8" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
          </button>

          <button onClick={() => setTab("my")} className="absolute flex items-center justify-center" style={{ left: 24, top: 100, width: 82, height: 36, borderRadius: 18, background: tab === "my" ? "#7c3aed" : "#f3f1f8" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: tab === "my" ? "#fff" : "#1d1b44" }}>My Teams</span>
          </button>
          <button onClick={() => setTab("requested")} className="absolute flex items-center justify-center" style={{ left: 114, top: 100, width: 89, height: 36, borderRadius: 18, background: tab === "requested" ? "#7c3aed" : "#f3f1f8" }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: tab === "requested" ? "#fff" : "#1d1b44" }}>Requested</span>
          </button>
        </>
      )}

      <div className="absolute flex flex-col" style={{ left: 24, top: searchOpen ? 140 : 150, gap: tab === "requested" ? 16 : ROW_GAP }}>
        {total === 0 ? (
          tab === "requested" ? (
            <div style={{ fontSize: 13, color: "#757080" }}>No requests yet. Request to join a project from Discover.</div>
          ) : (
            <div className="flex w-[354px] flex-col items-center text-center" style={{ marginTop: 60 }}>
              <div className="relative" style={{ width: 300, height: 300 }}>
                <div className="absolute" style={{ background: "#2ED573", left: 40.6, top: 148.2, width: 167.7, height: 68.8 }} />
                <div className="absolute" style={{ background: "#2ED573", left: 118.2, top: 45.9, width: 105.9, height: 171.2 }} />
                <div className="absolute rounded-full" style={{ background: "#0B2A5B", left: 135.9, top: 98.8, width: 15.9, height: 15.9 }} />
                <div className="absolute rounded-full" style={{ background: "#0B2A5B", left: 190.6, top: 98.8, width: 15.9, height: 15.9 }} />
                <div className="absolute rounded-full" style={{ background: "#115E59", left: 157.1, top: 123.5, width: 30, height: 7.1 }} />
              </div>
              <p style={{ marginTop: 16, fontSize: 19, fontWeight: 800, color: "#1d1b44" }}>You&apos;re not on a team yet</p>
              <p style={{ marginTop: 10, fontSize: 12.5, color: "#757080", lineHeight: "18px" }}>Browse Discover to find a project,<br />or start your own and invite people to join.</p>
              <Link href="/discover" style={{ marginTop: 34, width: 240, height: 50, borderRadius: 25, background: "linear-gradient(90deg, #7C3AED 0%, #6D28D9 100%)", boxShadow: "0px 6px 18px rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#fff" }}>Browse Discover</Link>
            </div>
          )
        ) : list.length === 0 ? (
          <div style={{ fontSize: 13, color: "#757080" }}>No matches for &quot;{q}&quot;.</div>
        ) : tab === "requested" ? (
          filteredRequests.map((r, i) => (
            <RequestRow key={r.id} color={COLORS[i % COLORS.length]} title={r.title} subtitle={r.subtitle} applied={r.applied} status={r.status} photoUrl={r.photoUrl} />
          ))
        ) : (
          filteredTeams.map((t, i) => (
            <TeamRow
              key={t.id}
              color={COLORS[i % COLORS.length]}
              title={t.title}
              subtitle={t.subtitle}
              href={t.kind === "dm" ? `/dm/${t.id}` : `/chat/${t.id}`}
              photoUrl={t.photoUrl}
              time={t.time}
              unread={t.unread}
              ended={t.ended}
              round={t.kind === "dm"}
            />
          ))
        )}
      </div>
    </div>
  );
}
