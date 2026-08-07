"use client";

import { useState, useTransition } from "react";
import { respondToInvite } from "@/app/invites/actions";

export default function InviteCard({ invite }) {
  const [done, setDone] = useState(null); // null | 'accepted' | 'declined'
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function respond(accept) {
    setError("");
    start(async () => {
      const res = await respondToInvite(invite.id, accept);
      if (res?.error) { setError(res.error); return; }
      setDone(accept ? "accepted" : "declined");
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-[15px] font-bold text-navy">{invite.title}</p>
      <p className="mt-0.5 text-[13px] text-muted">Invited by {invite.inviter}</p>

      {done ? (
        <p
          className="mt-3 text-[13px] font-bold"
          style={{ color: done === "accepted" ? "#298c52" : "#5b5b6b" }}
        >
          {done === "accepted" ? "Joined ✓" : "Declined"}
        </p>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => respond(true)}
            disabled={pending}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
            style={{ background: "#7c3aed" }}
          >
            Accept
          </button>
          <button
            onClick={() => respond(false)}
            disabled={pending}
            className="flex-1 rounded-xl py-2.5 text-[13px] font-bold disabled:opacity-50"
            style={{ background: "#f1f1f4", color: "#5b5b6b" }}
          >
            Decline
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-[12.5px] font-semibold" style={{ color: "#bf4247" }}>{error}</p>}
    </div>
  );
}
