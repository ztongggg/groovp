"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBar from "@/components/StatusBar";
import HomeProjectCard from "@/components/HomeProjectCard";

function BannerCloudy() {
  // Figma instance "Cloudy" 283.4x283.4, positioned left 142 top -18.9 inside the 342x168 banner (overflow-clip crops it)
  return (
    <div className="absolute overflow-hidden" style={{ left: 142, top: -18.92, width: 283.425, height: 283.425 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-a.svg" alt="" className="absolute" style={{ left: 157.09, top: 160.66, width: 69.912, height: 69.912 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-a.svg" alt="" className="absolute" style={{ left: 249.92, top: 160.66, width: 69.912, height: 69.912 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-b.svg" alt="" className="absolute" style={{ left: 249.92, top: 242.78, width: 69.912, height: 68.022 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-a.svg" alt="" className="absolute" style={{ left: 160.66, top: 249.92, width: 69.912, height: 69.912 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-c.svg" alt="" className="absolute" style={{ left: 139.24, top: 228.49, width: 41.569, height: 41.569 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-d.svg" alt="" className="absolute" style={{ left: 228.49, top: 139.24, width: 39.68, height: 41.569 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-c.svg" alt="" className="absolute" style={{ left: 321.32, top: 232.06, width: 41.569, height: 41.569 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy-bump-c.svg" alt="" className="absolute" style={{ left: 239.2, top: 321.32, width: 41.569, height: 41.569 }} />
      <div className="absolute rounded-full" style={{ background: "#0b2a5b", left: 214.21, top: 246.35, width: 16.279, height: 20.785 }} />
      <div className="absolute rounded-full" style={{ background: "#0b2a5b", left: 297.7, top: 246.35, width: 16.279, height: 20.785 }} />
      <div className="absolute rounded-full" style={{ background: "#1d4ed8", left: 260.63, top: 303.47, width: 9.448, height: 13.227 }} />
    </div>
  );
}

function GreetingBanner({ name, unread = 0 }) {
  return (
    <div className="relative overflow-hidden" style={{ width: 342, height: 168, borderRadius: 22.674, background: "#7c3aed" }}>
      <span className="absolute rounded-full" style={{ left: 263.35, top: 92.35, width: 4.25, height: 4.25, background: "#c7c3e0" }} />
      <span className="absolute rounded-full" style={{ left: 295.47, top: 92.35, width: 4.25, height: 4.25, background: "#c7c3e0" }} />
      <Link href="/notifications" aria-label="Notifications" className="absolute flex items-center justify-center rounded-full" style={{ left: 292.87, top: 18.9, width: 30.23, height: 30.23, background: "rgba(255,255,255,0.15)", zIndex: 3 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
        {unread > 0 && <span className="absolute rounded-full" style={{ right: -1, top: -1, width: 8.5, height: 8.5, background: "#f472b6", border: "2px solid #7c3aed" }} />}
      </Link>
      <div className="absolute" style={{ left: 18.9, top: 85, width: 200, fontSize: 26.5, fontWeight: 900, color: "#fff", lineHeight: "34px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
      <div className="absolute" style={{ left: 18.9, top: 122.8, fontSize: 12, fontWeight: 700, color: "#c7c3e0" }}>Ready to find your next project?</div>
      <BannerCloudy />
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

export default function HomeView({ name = "there", projects = [], recentlyViewed = [], unread = 0, invites = 0 }) {
  const [feed, setFeed] = useState("popular");
  const latest = [...projects].reverse();

  return (
    <div className="bg-white pb-3">
      <StatusBar />

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
        {invites > 0 && (
          <ShortcutButton label={`Invites (${invites})`} href="/invites">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>
          </ShortcutButton>
        )}
      </div>

      <h2 className="mt-4 px-[30px]" style={{ fontSize: 20, fontWeight: 800, color: "#434343" }}>Recently viewed</h2>
      {recentlyViewed.length === 0 ? (
        <div className="px-[30px] py-6 text-[14px] text-muted">Projects you open will show up here.</div>
      ) : (
        <div className="mt-[18px] flex gap-[14px] overflow-x-auto px-[30px] pb-2">
          {recentlyViewed.map((p) => (
            <HomeProjectCard key={p.id} {...p} members={["JK"]} join="purple" />
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
          {(feed === "popular" ? projects : latest).map((p) => (
            <HomeProjectCard key={p.id} {...p} members={["JK"]} join="green" />
          ))}
        </div>
      )}
    </div>
  );
}
