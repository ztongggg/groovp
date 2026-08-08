"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ProfileBanner,
  ProfileBody,
  ProfileMetaRow,
  ProfileTabs,
  ActionPill,
  AboutStatGrid,
  ProfileLinks,
  SkillsCard,
  InterestsCard,
  PastProjectCard,
  BANNER_MINE,
} from "@/components/ProfileParts";
import ConnectLinkedIn from "@/components/ConnectLinkedIn";
import ConnectGitHub from "@/components/ConnectGitHub";

const GearIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#1D1B44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
);

export default function ProfileView({
  userId,
  name,
  username,
  subtitle,
  avatarUrl = "",
  ratingLabel,
  ratingCount,
  personality = {},
  skills = [],
  interests = [],
  pastProjects = [],
  linkedinVerified = false,
  githubVerified = false,
  linkedinUrl = "",
  githubUrl = "",
  portfolioUrl = "",
  completeness = null,
  hidePersonality = false, // EXPERIMENT: see lib/experiment.js
}) {
  const [tab, setTab] = useState("about");

  return (
    <div className="min-h-full w-[402px] bg-white pb-10">
      <ProfileBanner
        banner={BANNER_MINE}
        backHref="/home"
        avatarUrl={avatarUrl}
        name={name}
        username={username}
        rightAction={
          <Link href="/settings" aria-label="Settings" style={{ width: 40, height: 40, borderRadius: 9999, background: "rgba(255,255,255,0.80)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GearIcon />
          </Link>
        }
      />

      <ProfileBody>
        <ProfileMetaRow
          subtitle={subtitle}
          rating={ratingLabel}
          ratingCount={ratingCount}
          ratingHref={`/ratings/${userId}`}
          action={<ActionPill href="/edit-profile">Edit Profile</ActionPill>}
        />

        {/* Completeness — eight equally-weighted fields (owner-confirmed).
            Hidden once complete so a finished profile isn't nagged at. */}
        {completeness && completeness.percent < 100 && (
          <Link href={completeness.missing[0]?.href || "/edit-profile"} style={{ display: "block", background: "#F5F0FF", borderRadius: 16, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1D1B44" }}>Profile {completeness.percent}% complete</p>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED" }}>{completeness.missing[0]?.label} ›</span>
            </div>
            <div style={{ marginTop: 8, height: 8, width: "100%", borderRadius: 999, background: "#E2D9F7", overflow: "hidden" }}>
              <div style={{ height: 8, borderRadius: 999, width: `${completeness.percent}%`, background: "#7C3AED" }} />
            </div>
          </Link>
        )}

        <ProfileTabs value={tab} onChange={setTab} />

        {tab === "about" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <AboutStatGrid personality={personality} hidePersonality={hidePersonality} />
            <ProfileLinks
              linkedinUrl={linkedinUrl}
              githubUrl={githubUrl}
              portfolioUrl={portfolioUrl}
              linkedinVerified={linkedinVerified}
              githubVerified={githubVerified}
            />

            {/* Verification lives here, not in Settings — it's proof attached
                to what teammates actually see on this page. */}
            {(!linkedinVerified || !githubVerified) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!linkedinVerified && <ConnectLinkedIn verified={false} />}
                {!githubVerified && <ConnectGitHub verified={false} />}
              </div>
            )}

            <SkillsCard skills={skills} editHref="/edit-profile/skills" />
            <InterestsCard interests={interests} editHref="/edit-profile/interests" />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {pastProjects.length === 0 ? (
              <p style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "#757080" }}>No past projects yet.</p>
            ) : (
              pastProjects.map((pp, i) => <PastProjectCard key={pp.id} entry={pp} index={i} />)
            )}
            {/* Kept deliberately: the Figma frame shows the populated list only,
                but this is the sole entry point to /past-projects/add. */}
            <Link href="/past-projects/add" style={{ display: "block", borderRadius: 16, border: "1.5px dashed #EDE9FE", padding: "14px 0", textAlign: "center", fontSize: 12.5, fontWeight: 700, color: "#7C3AED" }}>
              + Add a past project
            </Link>
          </div>
        )}
      </ProfileBody>
    </div>
  );
}
