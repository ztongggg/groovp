// Profile completeness — eight fields, equal weight (12.5% each).
// Owner-confirmed 2026-08-07: equal weighting over a matching-weighted formula,
// because the number has to be explainable in the UI without a footnote.
const FIELDS = [
  { key: "avatar", label: "Add a profile photo", href: "/edit-profile" },
  { key: "bio", label: "Write a short bio", href: "/edit-profile" },
  { key: "year", label: "Add your year", href: "/edit-profile" },
  { key: "major", label: "Add your major", href: "/edit-profile" },
  { key: "skills", label: "List your skills", href: "/edit-profile" },
  { key: "interests", label: "Pick your interests", href: "/edit-profile" },
  { key: "personality", label: "Answer the personality questions", href: "/edit-profile" },
  { key: "links", label: "Add a link", href: "/edit-profile" },
];

function filled(profile, key) {
  if (!profile) return false;
  switch (key) {
    case "avatar":
      return !!profile.avatar_url;
    case "bio":
      return !!(profile.bio || "").trim();
    case "year":
      return !!(profile.year || "").trim();
    case "major":
      return !!(profile.major || "").trim();
    case "skills":
      return (profile.skills || []).length > 0;
    case "interests":
      return (profile.interests || []).length > 0;
    case "personality":
      // The signup flow collects all four together, so any one being set means
      // the step was completed.
      return !!(profile.personality || profile.prefer_working || profile.best_work_time || profile.location);
    case "links":
      return !!(profile.linkedin_url || profile.github_url || profile.portfolio_url);
    default:
      return false;
  }
}

export function profileCompleteness(profile) {
  const done = FIELDS.filter((f) => filled(profile, f.key));
  const missing = FIELDS.filter((f) => !filled(profile, f.key));
  return {
    percent: Math.round((done.length / FIELDS.length) * 100),
    done: done.length,
    total: FIELDS.length,
    missing,
  };
}
