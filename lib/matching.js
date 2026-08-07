// Applicant <-> Group match scoring (backend spec v2 §5).
// overlap_count = shared skills + shared interests + shared personality traits.
// is_strong_match = overlap_count >= STRONG_MATCH_THRESHOLD ("a few overlapping," not just one).
// Only the specific overlapping attributes get highlighted — never the whole set.

export const STRONG_MATCH_THRESHOLD = 2;

const norm = (s) => (s || "").toString().trim().toLowerCase();

// RecruitingForm's "personality wanted" chips ("Morning", "Night owl") use different
// wording than the signup-collected values ("In the day time", "At night") — map them
// so matching isn't silently broken by vocabulary drift between the two forms.
// Also accepts the older "In the morning" value already stored on existing profiles
// from before the copy was corrected to match the Figma export.
function applicantPersonalityTerms(applicant) {
  const terms = [];
  if (applicant.personality) terms.push(applicant.personality);
  if (applicant.prefer_working) terms.push(applicant.prefer_working);
  if (applicant.best_work_time === "In the day time" || applicant.best_work_time === "In the morning") terms.push("Morning");
  if (applicant.best_work_time === "At night") terms.push("Night owl");
  return terms;
}

function overlap(wanted = [], have = []) {
  const haveSet = new Set(have.map(norm));
  return wanted.filter((w) => haveSet.has(norm(w)));
}

// group: { skills_wanted, interests_wanted, personality_wanted }
// applicant: { skills, interests, personality, prefer_working, best_work_time }
export function computeMatch(applicant, group) {
  const matchedSkills = overlap(group?.skills_wanted, applicant?.skills || []);
  const matchedInterests = overlap(group?.interests_wanted, applicant?.interests || []);
  const matchedPersonality = overlap(group?.personality_wanted, applicantPersonalityTerms(applicant));

  const overlapCount = matchedSkills.length + matchedInterests.length + matchedPersonality.length;
  return {
    overlapCount,
    isStrongMatch: overlapCount >= STRONG_MATCH_THRESHOLD,
    matchedSkills,
    matchedInterests,
    matchedPersonality,
  };
}
