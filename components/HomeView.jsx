"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBar from "@/components/StatusBar";
import HomeProjectCard from "@/components/HomeProjectCard";

function GreetingBanner({ name }) {
  return (
    <div className="relative overflow-hidden" style={{ height: 178, borderRadius: 24, background: "#1e1b4b" }}>
      {[[20, 22], [38, 22], [20, 40], [38, 40]].map(([l, t], i) => (
        <span key={i} className="absolute rounded-full" style={{ left: l, top: t, width: 9, height: 9, background: "#f472b6" }} />
      ))}
      <div className="absolute" style={{ left: 20, top: 90, width: 210, fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: "32px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
      <div className="absolute" style={{ left: 20, top: 130, fontSize: 12.5, fontWeight: 600, color: "#c7c3e0" }}>Ready to find your next project?</div>
      <div className="absolute rounded-full" style={{ left: 222, top: 50, width: 150, height: 150, background: "#e8a99f" }} />
      <span className="absolute" style={{ left: 300, top: 40, width: 2, height: 14, background: "#1f1a26" }} />
      <span className="absolute rounded-full" style={{ left: 296, top: 34, width: 10, height: 10, background: "#e8a99f", border: "2px solid #1f1a26" }} />
      <span className="absolute rounded-full" style={{ left: 266, top: 85, width: 30, height: 30, border: "2px solid #14121a" }} />
      <span className="absolute rounded-full" style={{ left: 298, top: 83, width: 34, height: 34, border: "2px solid #14121a" }} />
      <span className="absolute" style={{ left: 296, top: 99, width: 4, height: 2, background: "#14121a" }} />
      <span className="absolute rounded-full" style={{ left: 279, top: 98, width: 5, height: 5, background: "#14121a" }} />
      <span className="absolute rounded-full" style={{ left: 313, top: 98, width: 5, height: 5, background: "#14121a" }} />
      <span className="absolute" style={{ left: 291, top: 120, width: 12, height: 6, borderBottom: "2px solid #14121a", borderRadius: "0 0 8px 8px" }} />
    </div>
  );
}

function ShortcutButton({ label, href, children }) {
  const cls = "flex flex-1 items-center gap-3";
  const style = { height: 44, borderRadius: 14, background: "#1e1b4b", paddingLeft: 18 };
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

export default function HomeView({ name = "there", projects = [] }) {
  const [feed, setFeed] = useState("popular");
  const latest = [...projects].reverse();

  return (
    <div className="bg-white pb-3">
      <StatusBar />

      <div className="px-5">
        <div className="mt-2">
          <GreetingBanner name={name} />
        </div>
      </div>

      <div className="mt-3 flex gap-4 px-[30px]">
        <ShortcutButton label="Saved">
          <svg width="12" height="15" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12v18l-6-4-6 4V3Z" /></svg>
        </ShortcutButton>
        <ShortcutButton label="Requests" href="/applicants">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></svg>
        </ShortcutButton>
      </div>

      <h2 className="mt-4 px-[30px]" style={{ fontSize: 20, fontWeight: 800, color: "#434343" }}>Recently viewed</h2>
      {projects.length === 0 ? (
        <EmptyRow />
      ) : (
        <div className="mt-[18px] flex gap-[14px] overflow-x-auto px-[30px] pb-2">
          {projects.map((p) => (
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
