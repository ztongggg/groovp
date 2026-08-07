// Shared, non-interactive pieces of the Request History cards.
//
// These deliberately live outside ApplicantCard.jsx: that file is a Client
// Component, and every export of a "use client" module becomes a client
// reference. A server component importing a plain helper or a style object
// from it gets a proxy, not the value — calling appliedLabel() server-side
// throws, which is exactly how /applicants started 500ing.

export const APPLICANT_AVATARS = ["#A78BFA", "#FF8671", "#F2A5BD", "#4AC7B2", "#C380DD"];

export const CARD_STYLE = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #F3F1F8",
  boxShadow: "0px 2px 10px rgba(25,20,51,0.05)",
  padding: 8,
};

export function appliedLabel(iso) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return "Applied just now";
  const h = Math.floor(mins / 60);
  if (h < 24) return `Applied ${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Applied ${d} day${d === 1 ? "" : "s"} ago`;
  const w = Math.floor(d / 7);
  return `Applied ${w} week${w === 1 ? "" : "s"} ago`;
}

export function ApplicantFace({ url, index = 0, size = 44 }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" style={{ width: size, height: size, borderRadius: 9999, objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <span style={{ position: "relative", width: size, height: size, borderRadius: 9999, background: APPLICANT_AVATARS[index % APPLICANT_AVATARS.length], flexShrink: 0, display: "block" }}>
      <span style={{ position: "absolute", left: size * 0.18, top: size * 0.39, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: size * 0.68, top: size * 0.39, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: size * 0.36, top: size * 0.59, width: 12, height: 3, borderRadius: 9999, background: "#fff" }} />
    </span>
  );
}

export function StrongMatchPill() {
  return <span style={{ flexShrink: 0, background: "#D4F2DE", borderRadius: 10, padding: "3px 8px", fontSize: 8.5, fontWeight: 600, color: "#298C52" }}>Strong Match</span>;
}
