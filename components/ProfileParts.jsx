// Presentational building blocks shared by My Profile (/profile) and another
// user's profile (/u/[id]). Both Figma frames are the same layout with a
// different banner gradient and a different primary action, so they share
// everything below rather than keeping two drifting copies.
//
// No hooks in here on purpose: the file is imported by both a client component
// and (indirectly) by server pages.

import Link from "next/link";

/* ---------------------------------------------------------------- icons -- */

export const PersonIcon = ({ s = 18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>);
export const ChatIcon = ({ s = 18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 0 1-11.5 7.2L4 20l.8-4.5A8 8 0 1 1 20 12Z" /></svg>);
export const ClockIcon = ({ s = 18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const PinIcon = ({ s = 18 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>);
export const StarIcon = ({ s = 16, fill = "#1d1b44" }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2" strokeLinejoin="round"><path d="m12 3.5 2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.8l6-.7L12 3.5Z" /></svg>);
export const PencilSquareIcon = ({ s = 17 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#757080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" /></svg>);
export const CheckIcon = ({ s = 12, c = "#7c3aed" }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7" /></svg>);

const LinkedInGlyph = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.5 4.77 5.76v5.69h-4v-5.05c0-1.2-.02-2.75-1.75-2.75s-2.02 1.31-2.02 2.66v5.14h-4v-11Z" /></svg>);
const GitHubGlyph = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>);
const GlobeGlyph = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" /></svg>);

/* --------------------------------------------------------------- header -- */

export const BANNER_MINE = "linear-gradient(76deg, #7C3AED 0%, #3A1E83 100%)";
export const BANNER_OTHER = "linear-gradient(76deg, #4AC6B2 0%, #26655B 100%)";

// The mascot stand-in when a user hasn't uploaded a photo. Figma draws it as
// plain shapes, so it is drawn the same way here rather than shipped as an asset.
function MascotAvatar() {
  return (
    <div style={{ position: "absolute", left: 3, top: 4, width: 90, height: 90, borderRadius: 9999, background: "#FBBF24" }}>
      <span style={{ position: "absolute", left: 16.4, top: 34.8, width: 12.3, height: 12.3, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: 61.4, top: 34.8, width: 12.3, height: 12.3, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: 32.7, top: 53.2, width: 24.6, height: 6.1, borderRadius: 9999, background: "#fff" }} />
    </div>
  );
}

/**
 * The purple/teal banner with back button, a right-hand action, the avatar and
 * the name block. Fixed geometry straight from the Figma export — this is
 * chrome, not data-driven layout.
 */
export function ProfileBanner({ banner, backHref, rightAction, avatarUrl, name, username, badge = null, center = null }) {
  return (
    <div style={{ position: "relative", height: 205 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: 140, background: banner }} />

      {backHref && (
        <Link href={backHref} aria-label="Back" style={{ position: "absolute", left: 24, top: 48, width: 40, height: 40, borderRadius: 9999, background: "#F3F1F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44", lineHeight: 1 }}>‹</Link>
      )}
      {center && <div style={{ position: "absolute", left: 0, right: 0, top: 50, display: "flex", justifyContent: "center" }}>{center}</div>}
      {rightAction && <div style={{ position: "absolute", left: 338, top: 48, width: 40, height: 40 }}>{rightAction}</div>}

      <div style={{ position: "absolute", left: 20, top: 96, width: 96, height: 96, borderRadius: 9999, background: "#fff" }}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" style={{ position: "absolute", left: 3, top: 4, width: 90, height: 90, borderRadius: 9999, objectFit: "cover" }} />
        ) : (
          <MascotAvatar />
        )}
      </div>

      <div style={{ position: "absolute", left: 120, top: 140, right: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h1 style={{ fontSize: 25, fontWeight: 800, color: "#1D1B44", lineHeight: "34px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</h1>
          {badge}
        </div>
        <p style={{ fontSize: 12, fontWeight: 400, color: "#757080", marginTop: 3 }}>@{username}</p>
      </div>
    </div>
  );
}

/** Content column: left 33 / right 34, 15px gaps — matches the Figma frame. */
export function ProfileBody({ children }) {
  return <div style={{ paddingLeft: 33, paddingRight: 34, display: "flex", flexDirection: "column", gap: 15 }}>{children}</div>;
}

/** Subtitle + rating on the left, the screen's primary action pill on the right. */
export function ProfileMetaRow({ subtitle, rating, ratingCount, ratingHref, ratingsHidden = false, action }) {
  const stars = (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <StarIcon />
      <span style={{ fontSize: 18, fontWeight: 700, color: "#1D1B44" }}>{rating}</span>
      <span style={{ fontSize: 11.5, fontWeight: 400, color: "#757080" }}>({ratingCount} Ratings)</span>
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", minHeight: 38 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 400, color: "#757080" }}>{subtitle}</p>
        <div style={{ marginTop: 4 }}>
          {ratingsHidden ? (
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#757080" }}>Ratings are private</span>
          ) : ratingHref ? (
            <Link href={ratingHref}>{stars}</Link>
          ) : (
            stars
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function ActionPill({ href, children, tone = "quiet", icon = null, onClick }) {
  const style = {
    height: 36,
    minWidth: 112,
    padding: "0 14px",
    borderRadius: 18,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    fontSize: 11.5,
    fontWeight: 600,
    background: tone === "primary" ? "#7C3AED" : "#F3F1F8",
    color: tone === "primary" ? "#fff" : "#1D1B44",
  };
  if (href) return <Link href={href} style={style}>{icon}{children}</Link>;
  return <button type="button" onClick={onClick} style={style}>{icon}{children}</button>;
}

/* ----------------------------------------------------------------- tabs -- */

export function ProfileTabs({ value, onChange }) {
  return (
    <div style={{ height: 44, background: "#F3F1F8", borderRadius: 14, padding: 3, display: "flex", gap: 2 }}>
      {[["about", "About"], ["project", "Project"]].map(([k, label]) => {
        const on = value === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 11,
              fontSize: 13,
              fontWeight: on ? 600 : 400,
              color: on ? "#1D1B44" : "#757080",
              background: on ? "#fff" : "transparent",
              boxShadow: on ? "0px 2px 8px rgba(25,20,51,0.06)" : "none",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ about grid -- */

const STAT_TINTS = { personality: "#E0EDFF", prefer_working: "#DEF5E5", best_work_time: "#FAE0E0", location: "#FCEDD4" };

function StatCard({ tint, icon, label, value, matched }) {
  return (
    <div style={{ height: 60, borderRadius: 16, border: `1px solid ${matched ? "#298c52" : "#F3F1F8"}`, background: matched ? "#f2fbf5" : "#fff", padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 36, height: 36, borderRadius: 9999, background: tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: "#757080", letterSpacing: 0.2 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1D1B44", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</p>
      </div>
    </div>
  );
}

export function AboutStatGrid({ personality = {}, matchedPersonality = [] }) {
  const hit = (v) => !!v && matchedPersonality.some((m) => String(m).toLowerCase() === String(v).toLowerCase());
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 4, rowGap: 8 }}>
      <StatCard tint={STAT_TINTS.personality} icon={<PersonIcon />} label="PERSONALITY" value={personality.personality} matched={hit(personality.personality)} />
      <StatCard tint={STAT_TINTS.prefer_working} icon={<ChatIcon />} label="PREFER WORKING" value={personality.prefer_working} matched={hit(personality.prefer_working)} />
      <StatCard tint={STAT_TINTS.best_work_time} icon={<ClockIcon />} label="BEST WORK TIME" value={personality.best_work_time} matched={hit(personality.best_work_time)} />
      <StatCard tint={STAT_TINTS.location} icon={<PinIcon />} label="LOCATION" value={personality.location} matched={hit(personality.location)} />
    </div>
  );
}

/* ---------------------------------------------------------------- links -- */

const PLATFORMS = {
  linkedin: { label: "LinkedIn", bg: "#0A66C2", glyph: <LinkedInGlyph /> },
  github: { label: "GitHub", bg: "#BF4247", glyph: <GitHubGlyph /> },
  portfolio: { label: "Portfolio Website", bg: "#9496F4", glyph: <GlobeGlyph /> },
};

function LinkRow({ kind, url, verified }) {
  if (!url) return null;
  const p = PLATFORMS[kind];
  const href = url.startsWith("http") ? url : `https://${url}`;
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{ background: "#fff", borderRadius: 20, border: "1px solid #EDE9FE", boxShadow: "0px 2px 10px rgba(25,20,51,0.05)", padding: "15px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 38, height: 38, borderRadius: 12, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p.glyph}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E1B4B", lineHeight: "19.5px" }}>{p.label}</span>
        <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#7C3AED", lineHeight: "16.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url.replace(/^https?:\/\//, "")}</span>
      </span>
      {verified && (
        <span style={{ flexShrink: 0, background: "#F3F1F8", borderRadius: 999, padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <CheckIcon />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", lineHeight: "16.5px" }}>Verified</span>
        </span>
      )}
    </a>
  );
}

export function ProfileLinks({ linkedinUrl, githubUrl, portfolioUrl, linkedinVerified, githubVerified }) {
  if (!linkedinUrl && !githubUrl && !portfolioUrl) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <LinkRow kind="linkedin" url={linkedinUrl} verified={linkedinVerified} />
      <LinkRow kind="github" url={githubUrl} verified={githubVerified} />
      <LinkRow kind="portfolio" url={portfolioUrl} verified={false} />
    </div>
  );
}

/* ------------------------------------------------------- skills/interests -- */

function TagCardShell({ label, editHref, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1.1px solid #EDE9FE", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#757080", letterSpacing: 0.3 }}>{label}</p>
        {editHref && <Link href={editHref} aria-label={`Edit ${label.toLowerCase()}`}><PencilSquareIcon /></Link>}
      </div>
      {children}
    </div>
  );
}

const chipBase = { background: "#F3F1F8", borderRadius: 999, padding: "5px 10px", display: "inline-flex", alignItems: "center", gap: 5 };
const chipMatched = { background: "#d4f2de", border: "1px solid #298c52" };

export function SkillsCard({ skills = [], editHref, matchedSkills = [] }) {
  const hit = (n) => matchedSkills.some((m) => String(m).toLowerCase() === String(n).toLowerCase());
  return (
    <TagCardShell label="SKILLS" editHref={editHref}>
      {skills.length === 0 ? (
        <p style={{ fontSize: 12, color: "#757080" }}>Nothing added yet.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {skills.map((s) => {
            const name = typeof s === "string" ? s : s.name;
            const level = typeof s === "string" ? null : s.level;
            return (
              <span key={name} style={hit(name) ? { ...chipBase, ...chipMatched } : chipBase}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1D1B44", lineHeight: "18px" }}>{name}</span>
                {level && (
                  <span style={{ height: 15, background: "#ECE8FC", borderRadius: 9, padding: "0 6px", display: "inline-flex", alignItems: "center" }}>
                    <span style={{ fontSize: 8.5, fontWeight: 700, color: "#6126CC" }}>{String(level).toUpperCase()}</span>
                  </span>
                )}
              </span>
            );
          })}
        </div>
      )}
    </TagCardShell>
  );
}

export function InterestsCard({ interests = [], editHref, matchedInterests = [] }) {
  const hit = (n) => matchedInterests.some((m) => String(m).toLowerCase() === String(n).toLowerCase());
  return (
    <TagCardShell label="INTERESTS" editHref={editHref}>
      {interests.length === 0 ? (
        <p style={{ fontSize: 12, color: "#757080" }}>Nothing added yet.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {interests.map((t) => (
            <span key={t} style={hit(t) ? { ...chipBase, ...chipMatched } : chipBase}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1D1B44", lineHeight: "18px" }}>{t}</span>
            </span>
          ))}
        </div>
      )}
    </TagCardShell>
  );
}

/* -------------------------------------------------------- past projects -- */

const BAND_COLOURS = ["#4AC7B2", "#B1B4ED", "#C4B5FD", "#F2A5BD"];

function shortDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * A past-project card. The photo band only renders when the entry actually has
 * a photo — the Figma frame shows both variants (banded and bandless) side by
 * side, so a placeholder band on every card would be wrong.
 */
export function PastProjectCard({ entry, index = 0 }) {
  const proj = entry.project;
  const photo = (entry.photos || [])[0] || null;
  const start = shortDate(proj?.timeline_start);
  const end = shortDate(proj?.timeline_end);
  const ongoing = proj?.timeline_end ? new Date(proj.timeline_end) > new Date() : true;
  const dates = start ? `${start} - ${end && !ongoing ? end : "Present"}` : null;
  return (
    <Link href={`/past-projects/${entry.id}`} style={{ display: "block", background: "#fff", borderRadius: 20, border: "1px solid #F3F1F8", boxShadow: "0px 2px 10px rgba(25,20,51,0.05)", overflow: "hidden" }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
      ) : entry.photos?.length ? (
        <div style={{ height: 100, background: BAND_COLOURS[index % BAND_COLOURS.length] }} />
      ) : null}
      <div style={{ padding: 16 }}>
        {/* An entry that isn't linked to a real project has no name of its own
            (past_projects has no name column), so the role becomes the title —
            in which case don't repeat it on the subtitle line. */}
        <p style={{ fontSize: 14, fontWeight: 700, color: "#1D1B44" }}>{proj?.name || entry.role || "Untitled project"}</p>
        {(() => {
          const parts = [proj?.name ? entry.role : null, proj ? (ongoing ? "Ongoing" : "Completed") : null].filter(Boolean);
          if (!parts.length) return null;
          return <p style={{ fontSize: 11, fontWeight: 600, color: "#6126CC", marginTop: 4 }}>{parts.join(" · ")}</p>;
        })()}
        {entry.write_up && <p style={{ fontSize: 11, fontWeight: 400, color: "#757080", marginTop: 6 }}>{entry.write_up}</p>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <span style={{ fontSize: 10.5, color: "#757080" }}>{dates || ""}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#7C3AED" }}>View more ›</span>
        </div>
      </div>
    </Link>
  );
}
