import Link from "next/link";
import MemberBlobs from "@/components/MemberBlobs";

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="2.4" /><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="19" r="2.4" />
      <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="14" height="13" viewBox="0 0 24 22" fill="none" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" />
    </svg>
  );
}

// Exact Home "Join Project Card" — 280x299, absolute internals per Figma.
export default function HomeProjectCard({
  id,
  title,
  desc,
  tags,
  skills = [],
  matchedTags = [],
  memberCount = 0,
  count,
  date,
  badge,
  coverImageUrl,
}) {
  const chips = tags || skills;
  return (
    <Link
      href={id ? `/project/${id}` : "#"}
      className="relative block shrink-0 overflow-hidden"
      style={{ width: 280, height: 299, borderRadius: 17.6, background: "#fff", border: "0.84px solid #e4e3e3" }}
    >
      {/* image header */}
      {coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImageUrl} alt="" className="absolute left-0 top-0 object-cover" style={{ width: 280, height: 75 }} />
      ) : (
        <div className="absolute left-0 top-0" style={{ width: 280, height: 75, background: "#d9d9d9" }} />
      )}

      {/* strong-match badge */}
      {badge && (
        <div className="absolute flex items-center justify-center" style={{ left: 12, top: 9, height: 24, padding: "0 12px", background: "rgba(124,58,237,0.90)", borderRadius: 999 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#e8e6f5" }}>{badge}</span>
        </div>
      )}

      {/* share / heart */}
      <div className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 210, top: 14, width: 28, height: 28 }}><ShareIcon /></div>
      <div className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 246, top: 14, width: 28, height: 28 }}><HeartIcon /></div>

      {/* title / desc */}
      <div
        className="absolute truncate"
        style={{ left: 12, top: 91, width: 256, fontSize: 13.41, fontWeight: 800, color: "#1e1b4b", lineHeight: "15.09px" }}
      >
        {title}
      </div>
      <div
        className="absolute overflow-hidden"
        style={{ left: 13, top: 109, width: 254, height: 27, fontSize: 10.9, fontWeight: 600, color: "#4b5563", lineHeight: "13.41px" }}
      >
        {desc}
      </div>

      {/* skills/interests — matched-against-viewer chips highlighted, rest neutral */}
      <div className="absolute flex gap-2 overflow-hidden" style={{ left: 13, top: 147, width: 256, height: 19 }}>
        {chips.slice(0, 3).map((s) => {
          const matched = matchedTags.includes(s);
          return (
            <span
              key={s}
              className="inline-flex shrink-0 items-center"
              style={{ height: 19, padding: "0 10px", borderRadius: 12.99, fontSize: 8.38, fontWeight: 800, lineHeight: "15.09px", background: matched ? "#DEF5E5" : "#F3F1F8", color: "#1D1B44", border: `1px solid ${matched ? "#33B273" : "transparent"}` }}
            >
              {s}
            </span>
          );
        })}
      </div>

      {/* member blobs */}
      <div className="absolute" style={{ left: 13, top: 177 }}>
        <MemberBlobs count={memberCount} size={19} />
      </div>
      {/* members count */}
      <div className="absolute" style={{ right: 12, top: 180, fontSize: 8.38, fontWeight: 700, color: "#6b7280", lineHeight: "13.41px" }}>{count} members</div>

      {/* date */}
      <div className="absolute" style={{ left: 13, top: 219, fontSize: 10.06, fontWeight: 700, color: "#6b7280", lineHeight: "13.41px" }}>{date}</div>

      {/* join CTA (whole card links to the project) */}
      <span
        className="absolute flex items-center justify-center"
        style={{ left: 12, top: 246, width: 257, height: 35, borderRadius: 17.6, background: "#7c3aed" }}
      >
        <span style={{ fontSize: 10.9, fontWeight: 800, color: "#fff", lineHeight: "16.35px" }}>Join Project</span>
      </span>
    </Link>
  );
}
