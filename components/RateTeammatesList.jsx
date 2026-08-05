"use client";

import RateForm from "@/components/RateForm";

// Shared "rate each of these teammates" list — used by both the leader's
// End Project flow and the standalone Rate page any ended-group member can
// reach (e.g. from a rate_reminder notification), so there's one place this
// UI lives instead of drifting copies.
export default function RateTeammatesList({ members, projectId }) {
  if (!members.length) {
    return <p className="text-center text-[14px] text-muted">No other teammates to rate in this group.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {members.map((m) => <RateForm key={m.userId} rateeId={m.userId} name={m.name} projectId={projectId} />)}
    </div>
  );
}
