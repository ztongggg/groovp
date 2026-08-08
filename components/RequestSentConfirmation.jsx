"use client";

import Link from "next/link";
import Blobby from "@/components/Blobby";
import Confetti, { CONFETTI_HIGH } from "@/components/Confetti";

// Request Sent Confirmation (Figma node 1192:869, re-exported 2026-08-09).
// The fresh export is a full-screen white takeover with confetti — not the
// bottom-sheet drawer this used to be — matching Signup Complete/Create
// Project Congrats' visual language. Shared by RequestButton.jsx (Discover)
// and JoinGroupButton.jsx (Project Details/elsewhere), which previously had
// two drifted implementations (only RequestButton ever got the Blobby
// treatment; JoinGroupButton was still a plain green-checkmark sheet).
export default function RequestSentConfirmation({ subtitle, onKeepBrowsing }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-white">
      <div className="relative w-[402px] bg-white" style={{ height: 874 }}>
        <Confetti pieces={CONFETTI_HIGH} />
        <div className="absolute" style={{ left: 56, top: 180, width: 300, height: 300 }}><Blobby size={300} /></div>
        <p className="absolute w-full text-center" style={{ top: 467, fontSize: 22, fontWeight: 700, color: "#1d1b44" }}>Request sent!</p>
        <p className="absolute text-center" style={{ left: 63, top: 501, width: 282, fontSize: 12.5, color: "#757080" }}>
          {subtitle ? `${subtitle}'s leader will review your request.` : "The leader will review your request."} We&apos;ll notify you when they respond.
        </p>
        <button onClick={onKeepBrowsing} className="absolute flex items-center justify-center" style={{ left: 32, top: 737, width: 338, height: 56, borderRadius: 28, background: "#7c3aed" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Keep Browsing</span>
        </button>
        <Link href="/teams" className="absolute flex items-center justify-center" style={{ left: 32, top: 805, width: 338, height: 48, borderRadius: 24, background: "#f9f8fb" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1d1b44" }}>View Request Status</span>
        </Link>
      </div>
    </div>
  );
}
