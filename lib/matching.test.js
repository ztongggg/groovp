import { describe, it, expect } from "vitest";
import { computeMatch, STRONG_MATCH_THRESHOLD } from "./matching";

describe("computeMatch", () => {
  it("counts shared skills, interests and personality separately", () => {
    const group = {
      skills_wanted: ["Python", "React"],
      interests_wanted: ["AI & ML"],
      personality_wanted: ["Introvert"],
    };
    const applicant = {
      skills: ["python", "Figma"], // case-insensitive match on "Python"
      interests: ["AI & ML"],
      personality: "Introvert",
    };
    const result = computeMatch(applicant, group);
    expect(result.matchedSkills).toEqual(["Python"]);
    expect(result.matchedInterests).toEqual(["AI & ML"]);
    expect(result.matchedPersonality).toEqual(["Introvert"]);
    expect(result.overlapCount).toBe(3);
  });

  it("is a strong match exactly at the threshold, not one below it", () => {
    const group = { skills_wanted: ["Python", "React"], interests_wanted: [], personality_wanted: [] };
    const oneMatch = computeMatch({ skills: ["Python"] }, group);
    const twoMatches = computeMatch({ skills: ["Python", "React"] }, group);
    expect(oneMatch.overlapCount).toBe(1);
    expect(oneMatch.isStrongMatch).toBe(false);
    expect(twoMatches.overlapCount).toBe(STRONG_MATCH_THRESHOLD);
    expect(twoMatches.isStrongMatch).toBe(true);
  });

  it("maps best_work_time vocabulary drift to what RecruitingForm's chips actually say", () => {
    const group = { skills_wanted: [], interests_wanted: [], personality_wanted: ["Morning", "Night owl"] };
    // Current copy value.
    expect(computeMatch({ best_work_time: "In the day time" }, group).matchedPersonality).toEqual(["Morning"]);
    // Legacy value from before the copy was corrected — must still score.
    expect(computeMatch({ best_work_time: "In the morning" }, group).matchedPersonality).toEqual(["Morning"]);
    expect(computeMatch({ best_work_time: "At night" }, group).matchedPersonality).toEqual(["Night owl"]);
  });

  it("returns zero overlap and false strong-match against an empty group ask", () => {
    const result = computeMatch({ skills: ["Python"], interests: ["Design"] }, {});
    expect(result.overlapCount).toBe(0);
    expect(result.isStrongMatch).toBe(false);
  });

  it("handles a missing applicant gracefully", () => {
    const group = { skills_wanted: ["Python"], interests_wanted: [], personality_wanted: [] };
    expect(() => computeMatch({}, group)).not.toThrow();
    expect(computeMatch({}, group).overlapCount).toBe(0);
  });
});
