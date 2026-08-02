"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";

/* ---------- icons (sized per Figma) ---------- */
const GearIcon = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v2.6M12 18.9v2.6M4 7l2.2 1.3M17.8 15.7 20 17M4 17l2.2-1.3M17.8 8.3 20 7" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
  </svg>
);
const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12a8 8 0 0 1-11.5 7.2L4 20l.8-4.5A8 8 0 1 1 20 12Z" />
  </svg>
);
const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);
const PinIcon = () => (
  <svg width="15" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" />
  </svg>
);
const EditIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#757080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 5l5 5M4 20l1-4L16 5l3 3L8 19l-4 1Z" />
  </svg>
);
const GithubIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="#fff">
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5L20 6" />
  </svg>
);

/* absolute-position helper */
const Box = ({ l, t, w, h, style, className, children }) => (
  <div
    className={className}
    style={{ position: "absolute", left: l, top: t, width: w, height: h, ...style }}
  >
    {children}
  </div>
);

const STATS = [
  { l: 26, t: 337, tint: "#e0edff", icon: <UserIcon />, label: "PERSONALITY", value: "Introvert" },
  { l: 211, t: 337, tint: "#def5e5", icon: <ChatIcon />, label: "PREFER WORKING", value: "Online" },
  { l: 26, t: 405, tint: "#ebe5fc", icon: <ClockIcon />, label: "BEST WORK TIME", value: "At night" },
  { l: 211, t: 405, tint: "#fcedd4", icon: <PinIcon />, label: "LOCATION", value: "Central" },
];

const LINKS = [
  { t: 477, bg: "#0a66c2", icon: <span style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>in</span>, title: "LinkedIn", url: "linkedIn.com/alex_chen", verified: true },
  { t: 557, bg: "#bf4247", icon: <GithubIcon />, title: "GitHub", url: "github.com/alex_chen" },
  { t: 637, bg: "#9496f4", icon: <GlobeIcon />, title: "Portfolio Website", url: "github.com/alex_chen_portfolio" },
];

const SKILLS = [
  { l: 43, t: 761, w: 67, txt: "Python" },
  { l: 118, t: 761, w: 86, txt: "TypeScript" },
  { l: 212, t: 761, w: 83, txt: "JavaScript" },
  { l: 43, t: 798, w: 68, txt: "Node.js" },
  { l: 120, t: 798, w: 92, txt: "TensorFlow" },
  { l: 221, t: 798, w: 61, txt: "Figma" },
];
const INTERESTS = [
  { l: 43, t: 899, w: 125, txt: "Machine Learning" },
  { l: 174, t: 899, w: 67, txt: "EdTech" },
  { l: 247, t: 899, w: 98, txt: "Open Source" },
  { l: 43, t: 936, w: 93, txt: "Hackathons" },
  { l: 142, t: 936, w: 75, txt: "Startups" },
  { l: 223, t: 936, w: 50, txt: "NLP" },
];

const CARD_SHADOW = "0 2px 8px rgba(124,58,237,0.06)";

function Chip({ l, t, w, txt }) {
  return (
    <Box l={l} t={t} w={w} h={30} className="rounded-full" style={{ background: "#f3f1f8" }}>
      <span
        className="flex h-full items-center justify-center"
        style={{ fontSize: 12, fontWeight: 700, color: "#1d1b44" }}
      >
        {txt}
      </span>
    </Box>
  );
}

export default function ProfilePage() {
  const [tab, setTab] = useState("about");

  return (
    <AppShell>
      <div className="relative w-[402px] bg-white" style={{ height: 1011 }}>
        {/* Banner */}
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: 140, background: "linear-gradient(135deg,#2d1a6b,#5929bf)" }}
        />
        {/* Settings */}
        <Box l={338} t={48} w={40} h={40} className="flex items-center justify-center rounded-full" style={{ background: "#fff" }}>
          <GearIcon />
        </Box>

        {/* Avatar */}
        <Box l={20} t={96} w={96} h={96} className="rounded-full" style={{ background: "#fff" }} />
        <Box l={24} t={100} w={88} h={88} className="rounded-full" style={{ background: "#f29c38" }} />
        <Box l={49} t={140} w={10} h={10} className="rounded-full" style={{ background: "#fff" }} />
        <Box l={77} t={140} w={10} h={10} className="rounded-full" style={{ background: "#fff" }} />
        <Box l={61} t={156} w={15} h={5} style={{ background: "#fff", borderRadius: 2.4 }} />

        {/* Identity text */}
        <Box l={120} t={146} style={{ fontSize: 25, fontWeight: 800, color: "#1d1b44", lineHeight: "30px" }}>
          Alex Chen
        </Box>
        <Box l={120} t={174} style={{ fontSize: 12, fontWeight: 400, color: "#757080" }}>
          @alex_chen
        </Box>
        <Box l={20} t={200} style={{ fontSize: 12, fontWeight: 400, color: "#757080" }}>
          Y3 · Computer Science · SUTD
        </Box>
        <Box l={20} t={214} style={{ fontSize: 18, fontWeight: 800, color: "#1d1b44" }}>
          ★ 4.9
        </Box>
        <Box l={78} t={220} style={{ fontSize: 11.5, fontWeight: 400, color: "#757080" }}>
          (3 Ratings)
        </Box>

        {/* Edit Profile */}
        <Box l={276} t={200} w={112} h={36} className="flex items-center justify-center rounded-[18px]" style={{ background: "#ece8fc" }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#6126cc" }}>Edit Profile</span>
        </Box>

        {/* Tabs */}
        <Box l={20} t={253} w={368} h={44} className="rounded-[14px]" style={{ background: "#f3f1f8" }}>
          <div
            className="absolute rounded-[11px]"
            style={{
              left: tab === "about" ? 3 : 181,
              top: 3,
              width: 184,
              height: 38,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(26,20,51,0.06)",
              transition: "left .2s",
            }}
          />
          <button
            onClick={() => setTab("about")}
            className="absolute"
            style={{ left: 0, top: 13, width: 184, textAlign: "center", fontSize: 13, fontWeight: tab === "about" ? 600 : 400, color: tab === "about" ? "#1d1b44" : "#757080" }}
          >
            About
          </button>
          <button
            onClick={() => setTab("project")}
            className="absolute"
            style={{ left: 184, top: 13, width: 184, textAlign: "center", fontSize: 13, fontWeight: tab === "project" ? 600 : 400, color: tab === "project" ? "#1d1b44" : "#757080" }}
          >
            Project
          </button>
        </Box>

        {tab === "about" && (
          <>
            {/* ABOUT ME */}
            <Box l={26} t={315} style={{ fontSize: 11, fontWeight: 700, color: "#757080", letterSpacing: 0.5 }}>
              ABOUT ME
            </Box>

            {/* Stat cards */}
            {STATS.map((s) => (
              <Box key={s.label} l={s.l} t={s.t} w={173} h={60} className="rounded-[16px]" style={{ background: "#faf9fc", border: "1px solid #f0edf5" }}>
                <div className="absolute flex items-center justify-center rounded-full" style={{ left: 12, top: 12, width: 36, height: 36, background: s.tint }}>
                  {s.icon}
                </div>
                <div className="absolute" style={{ left: 58, top: 16, fontSize: 9, fontWeight: 700, color: "#757080", letterSpacing: 0.4 }}>
                  {s.label}
                </div>
                <div className="absolute" style={{ left: 58, top: 28, fontSize: 14, fontWeight: 600, color: "#1d1b44" }}>
                  {s.value}
                </div>
              </Box>
            ))}

            {/* Link cards */}
            {LINKS.map((c) => (
              <Box key={c.title} l={26} t={c.t} w={361} h={68} className="rounded-[20px]" style={{ background: "#fff", border: "1px solid #ede9fe", boxShadow: CARD_SHADOW }}>
                <div className="absolute flex items-center justify-center rounded-[12px]" style={{ left: 17, top: 15, width: 38, height: 38, background: c.bg }}>
                  {c.icon}
                </div>
                <div className="absolute" style={{ left: 67, top: 16, fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>
                  {c.title}
                </div>
                <div className="absolute" style={{ left: 67, top: 36, fontSize: 11, fontWeight: 600, color: "#7c3aed" }}>
                  {c.url}
                </div>
                {c.verified && (
                  <div className="absolute flex items-center gap-1 rounded-full" style={{ left: 267, top: 22, height: 25, padding: "0 10px", background: "#ede9fe" }}>
                    <CheckIcon />
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#7c3aed" }}>Verified</span>
                  </div>
                )}
              </Box>
            ))}

            {/* Skills card */}
            <Box l={26} t={717} w={362} h={126} className="rounded-[20px]" style={{ background: "#fff", border: "1px solid #ede9fe" }}>
              <div className="absolute" style={{ left: 17, top: 18, fontSize: 11, fontWeight: 700, color: "#757080", letterSpacing: 0.5 }}>SKILLS</div>
              <div className="absolute" style={{ left: 327, top: 16 }}><EditIcon /></div>
            </Box>
            {SKILLS.map((c) => <Chip key={c.txt} {...c} />)}

            {/* Interests card */}
            <Box l={26} t={855} w={362} h={126} className="rounded-[20px]" style={{ background: "#fff", border: "1px solid #ede9fe" }}>
              <div className="absolute" style={{ left: 17, top: 18, fontSize: 11, fontWeight: 700, color: "#757080", letterSpacing: 0.5 }}>INTERESTS</div>
              <div className="absolute" style={{ left: 327, top: 16 }}><EditIcon /></div>
            </Box>
            {INTERESTS.map((c) => <Chip key={c.txt} {...c} />)}
          </>
        )}
      </div>
      <div style={{ height: 24 }} />
    </AppShell>
  );
}
