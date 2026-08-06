"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RateTeammatesList from "@/components/RateTeammatesList";
import { endProject } from "@/app/groups/[groupId]/actions";
import { addPastProjectForProject } from "@/app/groups/[groupId]/end/actions";

export default function EndProjectFlow({ groupId, groupName, groupStatus, projectId, members }) {
  const router = useRouter();
  const [step, setStep] = useState(groupStatus === "Ended" ? "rate" : "confirm");
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [writeUp, setWriteUp] = useState("");
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState(false);

  async function onConfirmEnd() {
    setEnding(true); setError("");
    const r = await endProject(groupId);
    setEnding(false);
    if (r?.error) { setError(r.error); return; }
    setStep(members.length > 0 ? "rate" : "addProject");
  }

  async function onAddProject() {
    setSaving(true); setError("");
    const r = await addPastProjectForProject(projectId, role, writeUp);
    setSaving(false);
    if (r?.error) { setError(r.error); return; }
    setAdded(true);
  }

  if (step === "confirm") {
    return (
      <div className="mt-16 flex flex-col items-center px-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#d44d52" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" /></svg>
        </span>
        <p className="mt-4 text-[20px] font-extrabold text-navy">End this project?</p>
        <p className="mt-2 text-[14px] text-muted">This will close the Group chat {groupName ? `"${groupName}"` : ""}. Members will be prompted to rate each other, and the group chat will be archived.</p>
        {error && <p className="mt-3 text-[13px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
        <button onClick={onConfirmEnd} disabled={ending} className="mt-6 w-full rounded-2xl py-3.5 text-[15px] font-bold" style={{ background: "#fae0e0", color: "#bf4247" }}>
          {ending ? "Ending…" : "Yes, End Project"}
        </button>
        <button onClick={() => router.back()} className="mt-2 w-full rounded-2xl py-3.5 text-[15px] font-bold text-navy" style={{ background: "#f3f1f8" }}>Cancel</button>
      </div>
    );
  }

  if (step === "rate") {
    return (
      <div className="mt-6 flex flex-col gap-4 px-6">
        <div>
          <p className="text-[22px] font-extrabold text-navy">Rate your teammates</p>
          <p className="mt-1 text-[13px] text-muted">{groupName ? `"${groupName}" has ended.` : "This project has ended."} Leave a rating for each teammate.</p>
        </div>
        <RateTeammatesList members={members} projectId={projectId} onDone={() => setStep("addProject")} />
        <button onClick={() => setStep("addProject")} className="w-full rounded-2xl py-3 text-[14px] font-semibold text-muted">Skip for now</button>
      </div>
    );
  }

  if (step === "addProject") {
    if (added) {
      return (
        <div className="mt-16 flex flex-col items-center px-8 text-center">
          <p className="text-[20px] font-extrabold text-navy">All done ✓</p>
          <p className="mt-2 text-[14px] text-muted">Added to your profile.</p>
          <button onClick={() => router.push("/profile")} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-3.5 text-[15px] font-bold text-white">Go to profile</button>
        </div>
      );
    }
    return (
      <div className="mt-6 flex flex-col gap-3 px-6 text-center">
        <p className="text-[20px] font-extrabold text-navy">Add this to your profile?</p>
        <p className="text-[14px] text-muted">Showcase what you built — visible on your profile&apos;s Project tab.</p>
        <div className="mt-3 flex flex-col gap-2 text-left">
          <input placeholder="Your role (e.g. Frontend Lead)" value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl border border-line px-3 py-2.5 text-[14px] focus:outline-none" />
          <textarea placeholder="What did you build?" value={writeUp} onChange={(e) => setWriteUp(e.target.value)} rows={3} className="rounded-xl border border-line px-3 py-2.5 text-[14px] focus:outline-none" />
        </div>
        {error && <p className="text-[13px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}
        <button onClick={onAddProject} disabled={saving} className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-3.5 text-[15px] font-bold text-white disabled:opacity-50">
          {saving ? "Adding…" : "Add to profile"}
        </button>
        <button onClick={() => router.push("/profile")} className="py-2 text-[14px] font-semibold text-muted">Skip for now</button>
      </div>
    );
  }

  return null;
}
