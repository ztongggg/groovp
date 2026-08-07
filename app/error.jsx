"use client";

// Global error boundary (Next.js App Router convention — catches render/data
// errors anywhere under this segment). Figma node 895:2005 "Error – Something
// Went Wrong" — its own real Starry export, not shared with Splash's.
export default function Error({ reset }) {
  return (
    <div className="relative w-[402px] bg-white" style={{ height: 874 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/error-starry.png" alt="" className="absolute" style={{ left: 60, top: 208, width: 282, height: 282 }} />

      <p className="absolute w-full text-center" style={{ top: 472, fontSize: 19, fontWeight: 800, color: "#1d1b44" }}>Something went wrong</p>
      <div className="absolute w-full text-center" style={{ top: 504, fontSize: 12.5, color: "#757080", lineHeight: "normal" }}>
        <p>We couldn&apos;t load this. Check your connection</p>
        <p>and try again.</p>
      </div>

      <button
        onClick={() => reset()}
        className="absolute flex items-center justify-center"
        style={{ left: 101, top: 550, width: 200, height: 52, borderRadius: 26, background: "#7c3aed", boxShadow: "0px 8px 24px -4px rgba(26,20,51,0.12)" }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Try Again</span>
      </button>
    </div>
  );
}
