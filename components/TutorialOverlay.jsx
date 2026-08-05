"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeOnboardingTour } from "@/app/tutorial/actions";

// Shared spotlight+tooltip layer for all 5 tutorial screens. Sits on top of the
// REAL underlying screen (real data, same components used elsewhere) — this is
// purely a client-rendered overlay, not a separate data-fetching concern.
// Spotlight uses the box-shadow cutout trick: a transparent box at the target's
// coordinates with a huge shadow darkening everything else.
export default function TutorialOverlay({ step, spotlight, title, body, tooltipSide = "top", showSkip, backHref, nextHref, nextLabel = "Next" }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function skip() {
    start(async () => {
      await completeOnboardingTour();
      router.push("/home");
    });
  }

  // Whichever side of the spotlight has more room wins — avoids the tooltip
  // overlapping the highlighted element regardless of where it sits on screen.
  const roomAbove = spotlight.top;
  const roomBelow = 874 - (spotlight.top + spotlight.height);
  const placeBelow = roomBelow > roomAbove || tooltipSide === "bottom";
  const tooltipTop = placeBelow ? Math.min(760, spotlight.top + spotlight.height + 16) : Math.max(40, spotlight.top - 190);

  return (
    <div className="fixed inset-0 z-[200]" style={{ width: 402, left: "50%", transform: "translateX(-50%)" }}>
      {/* spotlight cutout — deliberately NOT pointer-events:none. The real button
          underneath should stay visually inert during the tour (spec's explicit
          note on Tutorial 3): Skip/Back/Next in the tooltip are the only live
          actions anywhere on these 5 screens. */}
      <div
        className="absolute"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
          borderRadius: spotlight.borderRadius ?? 16,
          boxShadow: "0 0 0 9999px rgba(15,13,35,0.78)",
          border: "2px solid #dcf674",
        }}
      />

      {/* tooltip card */}
      <div className="absolute flex flex-col items-center px-6" style={{ top: tooltipTop, left: 0, width: 402 }}>
        <div className="relative w-full rounded-2xl bg-white p-5 shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/blob-teal.png" alt="" className="absolute" style={{ width: 52, height: 52, borderRadius: 16, [placeBelow ? "top" : "bottom"]: -20, left: 20 }} />
          <p className="text-[15px] font-extrabold text-navy">{title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="rounded-full" style={{ width: n === step ? 18 : 6, height: 6, background: n === step ? "#7c3aed" : "#e2dfea", transition: "width .2s" }} />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            {backHref ? (
              <Link href={backHref} className="rounded-xl px-4 py-2.5 text-[13px] font-bold text-navy" style={{ background: "#f3f1f8" }}>‹ Back</Link>
            ) : <span />}
            {showSkip && (
              <button onClick={skip} disabled={pending} className="text-[13px] font-semibold text-muted disabled:opacity-50">Skip tour</button>
            )}
            {nextHref === "done" ? (
              <button onClick={skip} disabled={pending} className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-white" style={{ background: "#7c3aed" }}>{pending ? "…" : nextLabel}</button>
            ) : (
              <Link href={nextHref} className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-white" style={{ background: "#7c3aed" }}>{nextLabel} ›</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
