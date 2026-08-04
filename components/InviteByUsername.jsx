"use client";

import { useState } from "react";
import { inviteByUsername } from "@/app/recruiting/[groupId]/actions";

export default function InviteByUsername({ groupId }) {
  const [username, setUsername] = useState("");
  const [state, setState] = useState({ kind: "idle", msg: "" }); // idle | loading | ok | error

  async function onInvite() {
    if (!username.trim()) return;
    setState({ kind: "loading", msg: "" });
    const res = await inviteByUsername(groupId, username);
    if (res?.error) {
      setState({ kind: "error", msg: res.error });
    } else {
      setState({
        kind: "ok",
        msg: res.already ? "They've already been invited." : `Invite sent to ${res.name}.`,
      });
      setUsername("");
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-4">
      <p className="text-[14px] font-bold text-navy">Invite by username</p>
      <p className="mt-0.5 text-[12px] text-muted">They'll get a notification to accept or decline.</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex flex-1 items-center rounded-xl border border-line px-3" style={{ height: 42 }}>
          <span className="text-[14px] text-muted">@</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onInvite()}
            placeholder="username"
            className="ml-1 w-full bg-transparent text-[14px] text-navy outline-none"
          />
        </div>
        <button
          onClick={onInvite}
          disabled={state.kind === "loading" || !username.trim()}
          className="rounded-xl px-4 text-[13px] font-bold text-white disabled:opacity-50"
          style={{ height: 42, background: "#7c3aed" }}
        >
          {state.kind === "loading" ? "…" : "Invite"}
        </button>
      </div>
      {state.msg && (
        <p className="mt-2 text-[12px] font-semibold" style={{ color: state.kind === "error" ? "#bf4247" : "#298c52" }}>
          {state.msg}
        </p>
      )}
    </div>
  );
}
