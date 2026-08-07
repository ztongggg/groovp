import { describe, it, expect } from "vitest";
import { profileCompleteness } from "./completeness";

const FULL_PROFILE = {
  avatar_url: "https://x/a.png",
  bio: "Hi",
  year: "Y2",
  major: "CS",
  skills: ["Python"],
  interests: ["AI & ML"],
  personality: "Introvert",
  linkedin_url: "https://linkedin.com/in/x",
};

describe("profileCompleteness", () => {
  it("is 0% for an empty profile", () => {
    const r = profileCompleteness({});
    expect(r.percent).toBe(0);
    expect(r.done).toBe(0);
    expect(r.total).toBe(8);
    expect(r.missing).toHaveLength(8);
  });

  it("is 100% when every field is filled, and reports no missing items", () => {
    const r = profileCompleteness(FULL_PROFILE);
    expect(r.percent).toBe(100);
    expect(r.missing).toHaveLength(0);
  });

  it("counts any one of the 4 personality sub-fields as the whole step being done", () => {
    const r = profileCompleteness({ ...FULL_PROFILE, personality: "", prefer_working: "Online" });
    expect(r.missing.find((f) => f.key === "personality")).toBeUndefined();
  });

  it("treats whitespace-only bio/major as not filled", () => {
    const r = profileCompleteness({ ...FULL_PROFILE, bio: "   ", major: "" });
    expect(r.missing.map((f) => f.key)).toEqual(expect.arrayContaining(["bio", "major"]));
  });

  it("links each missing field to the screen that actually edits it", () => {
    const r = profileCompleteness({});
    const byKey = Object.fromEntries(r.missing.map((f) => [f.key, f.href]));
    expect(byKey.skills).toBe("/edit-profile/skills");
    expect(byKey.interests).toBe("/edit-profile/interests");
    expect(byKey.links).toBe("/edit-profile/links");
  });

  it("handles null profile without throwing", () => {
    expect(() => profileCompleteness(null)).not.toThrow();
    expect(profileCompleteness(null).percent).toBe(0);
  });
});
