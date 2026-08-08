"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ProfileBanner,
  ProfileBody,
  ProfileMetaRow,
  ProfileTabs,
  AboutStatGrid,
  ProfileLinks,
  SkillsCard,
  InterestsCard,
  PastProjectCard,
  BANNER_OTHER,
} from "@/components/ProfileParts";

/**
 * Another user's profile ("User A Profile" / "User B Profile" in Figma, plus
 * their "- Requested" variants). Same layout as My Profile with a teal banner,
 * a Message pill instead of Edit Profile, and a ⋯ menu instead of the gear.
 */
export default function UserProfileView({
  profile,
  subtitle,
  ratingLabel,
  ratingCount,
  ratingsHidden,
  pastProjects = [],
  match = null,
  blocked = false,
  backHref,
  paging = null, // { index, total, prevHref, nextHref }
  moderationMenu = null,
  messageButton = null,
  reviewBar = null,
  hidePersonality = false, // EXPERIMENT: see lib/experiment.js
}) {
  const [tab, setTab] = useState("about");
  const name = profile.full_name || profile.username || "Student";

  return (
    <div className="min-h-full w-[402px] bg-white pb-10">
      <ProfileBanner
        banner={BANNER_OTHER}
        backHref={backHref}
        avatarUrl={profile.avatar_url || ""}
        name={name}
        username={profile.username || "user"}
        rightAction={moderationMenu}
        badge={
          match?.isStrongMatch ? (
            <span style={{ flexShrink: 0, borderRadius: 999, padding: "4px 9px", fontSize: 10, fontWeight: 800, color: "#fff", background: "#7C3AED", whiteSpace: "nowrap" }}>✨ Strong Match</span>
          ) : null
        }
        center={
          paging && paging.total > 1 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.85)", borderRadius: 999, padding: "6px 12px" }}>
              <Link href={paging.prevHref || "#"} aria-label="Previous applicant" style={{ fontSize: 16, fontWeight: 700, color: "#1D1B44", opacity: paging.prevHref ? 1 : 0.35, pointerEvents: paging.prevHref ? "auto" : "none" }}>‹</Link>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1D1B44" }}>{paging.index + 1} of {paging.total}</span>
              <Link href={paging.nextHref || "#"} aria-label="Next applicant" style={{ fontSize: 16, fontWeight: 700, color: "#1D1B44", opacity: paging.nextHref ? 1 : 0.35, pointerEvents: paging.nextHref ? "auto" : "none" }}>›</Link>
            </div>
          ) : null
        }
      />

      {blocked && (
        <div style={{ margin: "0 24px 12px", borderRadius: 12, background: "#FAE0E0", padding: "12px 16px", fontSize: 12.5, fontWeight: 600, color: "#BF4247" }}>
          You&apos;ve blocked this user. Open the ⋯ menu to unblock.
        </div>
      )}

      <ProfileBody>
        <ProfileMetaRow
          subtitle={subtitle}
          rating={ratingLabel}
          ratingCount={ratingCount}
          ratingHref={ratingsHidden ? null : `/ratings/${profile.id}`}
          ratingsHidden={ratingsHidden}
          action={messageButton}
        />

        <ProfileTabs value={tab} onChange={setTab} />

        {tab === "about" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <AboutStatGrid
              personality={{
                personality: profile.personality,
                prefer_working: profile.prefer_working,
                best_work_time: profile.best_work_time,
                location: profile.location,
              }}
              matchedPersonality={match?.matchedPersonality || []}
              hidePersonality={hidePersonality}
            />
            <ProfileLinks
              linkedinUrl={profile.linkedin_url || ""}
              githubUrl={profile.github_url || ""}
              portfolioUrl={profile.portfolio_url || ""}
              linkedinVerified={!!profile.linkedin_verified}
              githubVerified={!!profile.github_verified}
            />
            <SkillsCard skills={profile.skillList || []} matchedSkills={match?.matchedSkills || []} />
            <InterestsCard interests={profile.interests || []} matchedInterests={match?.matchedInterests || []} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {pastProjects.length === 0 ? (
              <p style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "#757080" }}>No past projects yet.</p>
            ) : (
              pastProjects.map((pp, i) => <PastProjectCard key={pp.id} entry={pp} index={i} />)
            )}
          </div>
        )}
      </ProfileBody>

      {reviewBar && <div style={{ height: 72 }} />}
      {reviewBar}
    </div>
  );
}
