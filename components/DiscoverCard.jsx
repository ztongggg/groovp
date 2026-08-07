import Link from "next/link";
import RequestButton from "@/components/RequestButton";
import MemberBlobs from "@/components/MemberBlobs";

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
    <svg width="14" height="12" viewBox="0 0 24 22" fill="none" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" />
    </svg>
  );
}

// Exact 334x357 Discover project card, driven by DB data.
export default function DiscoverCard({ title, desc, tags, skills = [], matchedTags = [], memberCount = 0, count, date, groupId, projectId, strongMatch, coverImageUrl }) {
  const chips = tags || skills;
  return (
    <div className="relative shrink-0" style={{ width: 334, height: 357, borderRadius: 21, background: "#fff", border: "1px solid #e4e3e3" }}>
      <Link href={projectId ? `/project/${projectId}` : "#"} className="absolute left-0 top-0" style={{ width: 334, height: 285, borderRadius: 21, zIndex: 5 }} aria-label={`Open ${title}`} />
      {coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImageUrl} alt="" className="absolute left-0 top-0 object-cover" style={{ width: 334, height: 90, borderTopLeftRadius: 21, borderTopRightRadius: 21 }} />
      ) : (
        <div className="absolute left-0 top-0" style={{ width: 334, height: 90, background: "#d9d9d9", borderTopLeftRadius: 21, borderTopRightRadius: 21 }} />
      )}
      {strongMatch && (
        <div className="absolute flex items-center justify-center" style={{ left: 12, top: 12, zIndex: 6, height: 24, padding: "0 12px", borderRadius: 999, background: "rgba(124,58,237,0.90)" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#e8e6f5" }}>✨ Strong Match</span>
        </div>
      )}
      <div className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 259, top: 13, width: 27, height: 27 }}><ShareIcon /></div>
      <div className="absolute flex items-center justify-center rounded-full bg-white" style={{ left: 294, top: 13, width: 27, height: 27 }}><HeartIcon /></div>

      <div className="absolute" style={{ left: 14, top: 109, width: 300, fontSize: 16, fontWeight: 800, color: "#1e1b4b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      <div className="absolute" style={{ left: 15, top: 130, width: 303, height: 34, overflow: "hidden", fontSize: 13, fontWeight: 600, color: "#4b5563", lineHeight: "16px" }}>{desc}</div>

      <div className="absolute flex gap-[5px]" style={{ left: 15, top: 175, width: 305, overflow: "hidden", height: 23 }}>
        {chips.slice(0, 3).map((s) => {
          const matched = matchedTags.includes(s);
          return (
            <span key={s} className="inline-flex shrink-0 items-center" style={{ height: 23, padding: "0 12px", borderRadius: 16, fontSize: 10, fontWeight: 800, background: matched ? "#DEF5E5" : "#F3F1F8", color: "#1D1B44", border: `1px solid ${matched ? "#33B273" : "transparent"}` }}>{s}</span>
          );
        })}
      </div>

      <div className="absolute" style={{ left: 16, top: 211 }}>
        <MemberBlobs count={memberCount} size={23} />
      </div>
      <div className="absolute" style={{ right: 12, top: 215, fontSize: 10, fontWeight: 700, color: "#6b7280", lineHeight: "16px" }}>{count} members</div>

      <div className="absolute" style={{ left: 15, top: 261, fontSize: 12, fontWeight: 700, color: "#6b7280", lineHeight: "16px" }}>{date}</div>

      <RequestButton groupId={groupId} subtitle={title} />
    </div>
  );
}
