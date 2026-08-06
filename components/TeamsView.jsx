"use client";

import { useState } from "react";
import Link from "next/link";

const ROW_H = 76;
const ROW_GAP = 8;
const COLORS = ["#4ac7b2", "#f29c38", "#b1b4ed", "#f2a5bd"];

// Figma draws inbox avatars as a 50px tile with a face: rounded-square for a
// group, circle for a person.
function AvatarTile({ color, photoUrl, round, muted }) {
  const radius = round ? 25 : 16;
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt="" style={{ width: 50, height: 50, borderRadius: radius, objectFit: "cover" }} />;
  }
  return (
    <div className="relative" style={{ width: 50, height: 50, borderRadius: radius, background: muted ? "#bfbac7" : color }}>
      <span className="absolute rounded-full" style={{ left: 9, top: 18, width: 7, height: 7, background: muted ? "#111827" : "#fff" }} />
      <span className="absolute rounded-full" style={{ left: 34, top: 18, width: 7, height: 7, background: muted ? "#111827" : "#fff" }} />
      <span className="absolute" style={{ left: 18, top: 28, width: 14, height: 3, borderRadius: 45.61, background: muted ? "#be185d" : "#fff" }} />
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
    <div className="relative" style={ROW_STYLE}>
      <div className="absolute" style={{ left: 13, top: 13 }}>
        <AvatarTile color={color} photoUrl={photoUrl} />
      </div>
      <div className="absolute truncate" style={{ left: 74, top: 14, width: 165, fontSize: 14, fontWeight: 700, color: "#1d1b44" }}>{title}</div>
      <div className="absolute truncate" style={{ left: 74, top: 34, width: 200, fontSize: 11.5, fontWeight: 400, color: "#757080" }}>{subtitle}</div>
      <div className="absolute" style={{ left: 74, top: 52, fontSize: 10.5, fontWeight: 400, color: "#757080" }}>{applied}</div>
      <div className="absolute flex items-center" style={{ right: 14, top: 15, height: 22, padding: "0 12px", borderRadius: 11, background: s.bg }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: s.color }}>{s.label}</span>
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
      <div className="absolute" style={{ left: 24, top: 48, fontSize: 26, fontWeight: 800, color: "#1d1b44" }}>Messages</div>

      <button
        onClick={() => { setSearchOpen((v) => !v); if (searchOpen) setQ(""); }}
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

      {searchOpen && (
        <div className="absolute flex items-center" style={{ left: 24, top: 146, width: 354, height: 40, borderRadius: 14, background: "#f0eef5", paddingLeft: 14 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#757080" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="ml-2.5 w-full bg-transparent text-[13px] text-navy focus:outline-none" />
        </div>
      )}

      <div className="absolute flex flex-col" style={{ left: 24, top: searchOpen ? 198 : 150, gap: ROW_GAP }}>
        {total === 0 ? (
          tab === "requested" ? (
            <div style={{ fontSize: 13, color: "#757080" }}>No requests yet. Request to join a project from Discover.</div>
          ) : (
            <div className="flex w-[354px] flex-col items-center px-8 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/empty-teams.png" alt="" className="mb-4 h-40 w-40" />
              <p className="text-[16px] font-semibold text-navy">You&apos;re not on a team yet</p>
              <p className="mt-1 text-[14px] text-muted">Browse Discover to find a project, or start your own.</p>
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
