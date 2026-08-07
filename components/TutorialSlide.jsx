"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeOnboardingTour } from "@/app/tutorial/actions";

const TOTAL = 5;

/**
 * A single onboarding tour screen. Owner-supplied static image IS the screen —
 * no live components, no spotlight-position math against real data. Just the
 * picture plus a fixed control bar: Back, Skip tour, Next/Get Started.
 */
export default function TutorialSlide({ step, src, backHref, nextHref, nextLabel = "Next" }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function finish() {
    start(async () => {
      await completeOnboardingTour();
      router.push("/home");
    });
  }

  return (
    <div className="relative w-[402px] bg-black" style={{ height: 874 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`Tutorial step ${step} of ${TOTAL}`} className="absolute inset-0 h-full w-full object-cover" />

      <button
        onClick={finish}
        disabled={pending}
        className="absolute text-[13px] font-semibold text-white/90 drop-shadow disabled:opacity-50"
        style={{ right: 20, top: 20 }}
      >
        Skip tour
      </button>

      <div className="absolute flex items-center justify-center gap-1.5" style={{ left: 0, width: 402, bottom: 86 }}>
        {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => (
          <span key={n} className="rounded-full" style={{ width: n === step ? 18 : 6, height: 6, background: n === step ? "#7c3aed" : "rgba(255,255,255,0.4)", transition: "width .2s" }} />
        ))}
      </div>

      <div className="absolute flex items-center justify-between gap-3 px-6" style={{ left: 0, width: 402, bottom: 32 }}>
        {backHref ? (
          <Link href={backHref} className="rounded-xl px-5 py-3 text-[14px] font-bold text-navy" style={{ background: "rgba(255,255,255,0.92)" }}>‹ Back</Link>
        ) : <span />}
        {nextHref === "done" ? (
          <button onClick={finish} disabled={pending} className="rounded-xl px-6 py-3 text-[14px] font-bold text-white" style={{ background: "#7c3aed" }}>{pending ? "…" : nextLabel}</button>
        ) : (
          <Link href={nextHref} className="rounded-xl px-6 py-3 text-[14px] font-bold text-white" style={{ background: "#7c3aed" }}>{nextLabel} ›</Link>
        )}
      </div>
    </div>
  );
}
