function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="2.4" /><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="19" r="2.4" />
      <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="14" height="13" viewBox="0 0 24 22" fill="none" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" />
    </svg>
  );
}

// Exact Home "Join Project Card" — 280x299, absolute internals per Figma.
export default function HomeProjectCard({
  title,
  desc,
  skills = [],
  members = [],
  count,
  progress = 0.4,
  date,
  join = "purple", // "purple" | "green"
  badge,
}) {
  const joinBg = join === "green" ? "#dcf674" : "#7c3aed";
  const joinColor = join === "green" ? "#5f7900" : "#ffffff";

  return (
    <div
      className="relative shrink-0"
      style={{ width: 280, height: 299, borderRadius: 18, background: "#fff", border: "1px solid #e4e3e3" }}
    >
      {/* image header */}
      <div className="absolute left-0 top-0" style={{ width: 280, height: 75, background: "#d9d9d9", borderTopLeftRadius: 18, borderTopRightRadius: 18 }} />

      {/* strong applicant badge */}
      {badge && (
        <div className="absolute flex items-center" style={{ left: 12, top: 9, height: 24, padding: "0 12px", background: "#7c3aed", borderRadius: 999 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#e8e6f5" }}>{badge}</span>
        </div>
      )}

      {/* share / heart */}
      <div className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 210, top: 14, width: 28, height: 28 }}><ShareIcon /></div>
      <div className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 246, top: 14, width: 28, height: 28 }}><HeartIcon /></div>

      {/* title / desc */}
      <div className="absolute" style={{ left: 13, top: 91, fontSize: 13.4, fontWeight: 800, color: "#1e1b4b" }}>{title}</div>
      <div className="absolute" style={{ left: 13, top: 109, width: 254, fontSize: 10.9, fontWeight: 600, color: "#4b5563", lineHeight: "13.5px" }}>{desc}</div>

      {/* skills */}
      <div className="absolute flex flex-wrap gap-2" style={{ left: 13, top: 147, width: 256 }}>
        {skills.map((s, i) => (
          <span
            key={s}
            className="inline-flex items-center"
            style={{ height: 19, padding: "0 10px", borderRadius: 13, fontSize: 8.4, fontWeight: 800, background: i === 0 ? "#7c3aed" : "#f5f0ff", color: i === 0 ? "#fff" : "#7c3aed" }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* avatars */}
      <div className="absolute flex -space-x-1" style={{ left: 13, top: 177 }}>
        <span style={{ width: 19, height: 19, borderRadius: 999, background: "#e8863b", border: "1px solid #fff" }} />
        {members.map((m, i) => (
          <span key={i} className="inline-flex items-center justify-center" style={{ width: 19, height: 19, borderRadius: 999, background: "#7c3aed", border: "1px solid #fff", fontSize: 8.4, fontWeight: 800, color: "#fff" }}>{m}</span>
        ))}
      </div>
      {/* members count */}
      <div className="absolute" style={{ right: 9, top: 180, fontSize: 8.4, fontWeight: 700, color: "#6b7280" }}>{count} members</div>

      {/* progress */}
      <div className="absolute" style={{ left: 13, top: 210, width: 257, height: 2, background: "#e5e7eb", borderRadius: 2 }}>
        <div style={{ width: Math.round(257 * progress), height: 2, background: "#7c3aed", borderRadius: 2 }} />
      </div>

      {/* date */}
      <div className="absolute" style={{ left: 13, top: 217, fontSize: 10, fontWeight: 700, color: "#6b7280" }}>{date}</div>

      {/* join button */}
      <button
        className="absolute flex items-center justify-center"
        style={{ left: 13, top: 246, width: 257, height: 35, borderRadius: 12, background: joinBg }}
      >
        <span style={{ fontSize: 10.9, fontWeight: 800, color: joinColor }}>Join Project</span>
      </button>
    </div>
  );
}
