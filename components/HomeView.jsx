"use client";

import { useState } from "react";
import Link from "next/link";
import HomeProjectCard from "@/components/HomeProjectCard";

// Figma "swirl" mascot — eight cyan lobes with eyes and a mouth, drawn as plain
// divs the same way the design file constructs it. 283x283, cropped by the banner.
const SWIRL_LOBES = [
  { left: 83, top: 85, width: 70, height: 70 },
  { left: 132, top: 85, width: 70, height: 70 },
  { left: 132, top: 128, width: 70, height: 68 },
  { left: 85, top: 132, width: 70, height: 70 },
  { left: 74, top: 121, width: 42, height: 42 },
  { left: 121, top: 74, width: 40, height: 42 },
  { left: 170, top: 123, width: 42, height: 42 },
  { left: 127, top: 170, width: 42, height: 42 },
];

function BannerSwirl() {
  return (
    <div className="absolute" style={{ left: 142, top: -19, width: 283, height: 283 }}>
      {SWIRL_LOBES.map((l, i) => (
        <div key={i} className="absolute rounded-full" style={{ ...l, background: "#35d7ff" }} />
      ))}
      <div className="absolute" style={{ left: 113, top: 130, width: 16, height: 21, background: "#0b2a5b", borderRadius: 52.91 }} />
      <div className="absolute" style={{ left: 158, top: 130, width: 16, height: 21, background: "#0b2a5b", borderRadius: 52.91 }} />
      <div className="absolute" style={{ left: 138, top: 161, width: 9, height: 13, background: "#1d4ed8", borderRadius: 52.91 }} />
    </div>
  );
}

function GreetingBanner({ name, unread = 0 }) {
  return (
    <div className="relative overflow-hidden" style={{ width: 342, height: 168, borderRadius: 22.674, background: "#7c3aed" }}>
      <BannerSwirl />
      <span className="absolute rounded-full" style={{ left: 263, top: 92, width: 4, height: 4, background: "#7c3aed" }} />
      <span className="absolute rounded-full" style={{ left: 295, top: 92, width: 4, height: 4, background: "#7c3aed" }} />
      <Link href="/notifications" aria-label="Notifications" className="absolute flex items-center justify-center rounded-full" style={{ left: 293, top: 19, width: 30, height: 30, background: "#5b21b6", zIndex: 3 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
        {unread > 0 && <span className="absolute rounded-full" style={{ left: 20, top: -2, width: 9, height: 9, background: "#f04545" }} />}
      </Link>
      <div className="absolute" style={{ left: 19, top: 85, width: 240, fontSize: 26.45, fontWeight: 900, color: "#fff", lineHeight: "34px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", zIndex: 2 }}>{name}</div>
      <div className="absolute" style={{ left: 19, top: 123, fontSize: 12, fontWeight: 700, color: "#c7c3e0", zIndex: 2 }}>Ready to find your next project?</div>
    </div>
  );
}

function ShortcutButton({ label, href, children }) {
  const cls = "flex flex-1 items-center gap-3";
  const style = { height: 44, borderRadius: 14, background: "#7c3aed", paddingLeft: 18 };
  const inner = (
    <>
      {children}
      <span style={{ fontSize: 12.5, fontWeight: 800, color: "#fff" }}>{label}</span>
    </>
  );
  return href ? (
    <Link href={href} className={cls} style={style}>{inner}</Link>
  ) : (
    <button className={cls} style={style}>{inner}</button>
  );
}

function EmptyRow() {
  return <div className="px-[30px] py-6 text-[14px] text-muted">No projects yet — create one from Discover.</div>;
}

export default function HomeView({ name = "there", projects = [], popular = [], recentlyViewed = [], unread = 0, invites = 0 }) {
  const [feed, setFeed] = useState("popular");
  // `projects` arrives created_at DESC (Latest); `popular` is pre-sorted by
  // join-request + save count server-side.
  const shown = feed === "popular" ? (popular.length ? popular : projects) : projects;

  return (
    <div className="font-nunito bg-white pb-3">

      <div className="flex justify-center px-[30px]">
        <div className="mt-2">
          <GreetingBanner name={name} unread={unread} />
        </div>
      </div>

      <div className="mt-3 flex gap-4 px-[30px]">
        <ShortcutButton label="Saved" href="/saved">
          <svg width="12" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12v18l-6-4-6 4V3Z" /></svg>
        </ShortcutButton>
        <ShortcutButton label="Requests" href="/applicants">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></svg>
        </ShortcutButton>
      </div>

      {/* Not in the Figma frame (which has exactly two shortcuts) — kept as its own
          row so the two designed buttons keep their 163px width. */}
      {invites > 0 && (
        <div className="mt-3 flex px-[30px]">
          <ShortcutButton label={`Invites (${invites})`} href="/invites">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>
          </ShortcutButton>
        </div>
      )}

      <h2 className="mt-4 px-[30px]" style={{ fontSize: 20, fontWeight: 800, color: "#434343" }}>Recently viewed</h2>
      {recentlyViewed.length === 0 ? (
        <div className="px-[30px] py-6 text-[14px] text-muted">Projects you open will show up here.</div>
      ) : (
        <div className="mt-[18px] flex gap-[14px] overflow-x-auto px-[30px] pb-2">
          {recentlyViewed.map((p) => (
            <HomeProjectCard key={p.id} {...p} />
          ))}
        </div>
      )}

      <div className="mt-[18px] px-[30px]">
        <div className="relative flex" style={{ height: 46, borderRadius: 999, background: "#ececf3", padding: 4 }}>
          <div className="absolute rounded-full bg-white" style={{ left: feed === "popular" ? 4 : 175, top: 4, width: 163, height: 38, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", transition: "left .2s" }} />
          <button onClick={() => setFeed("popular")} className="relative flex-1" style={{ fontSize: 13, fontWeight: 800, color: feed === "popular" ? "#7c3aed" : "#8b8b99" }}>Popular</button>
          <button onClick={() => setFeed("latest")} className="relative flex-1" style={{ fontSize: 13, fontWeight: 800, color: feed === "latest" ? "#7c3aed" : "#8b8b99" }}>Latest</button>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="mt-[23px] flex gap-[14px] overflow-x-auto px-[30px] pb-2">
          {shown.map((p) => (
            <HomeProjectCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
