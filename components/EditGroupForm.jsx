"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateGroupName, updateGroupPhoto, removeMember, transferLeadership, leaveGroup } from "@/app/groups/[groupId]/actions";
import AvatarUpload from "@/components/AvatarUpload";

const AVATAR = ["#f29c38", "#f2a5bd", "#4ac7b2", "#7c3aed", "#34b9a8"];

export default function EditGroupForm({ group, meId, isLeader, members }) {
  const router = useRouter();
  const [name, setName] = useState(group.name || "");
  const [savingName, setSavingName] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(group.photo_url || "");
  const [menuFor, setMenuFor] = useState(null); // userId of the row whose ⋯ menu is open
  const [choice, setChoice] = useState(null); // null | "transfer" | "confirmLeave"
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const others = members.filter((m) => m.userId !== meId);

  async function onPhotoChange(url) {
    setPhotoUrl(url);
    const r = await updateGroupPhoto(group.id, url);
    if (r?.error) setError(r.error);
    else router.refresh();
  }

  async function saveName() {
    if (name.trim() === group.name) return;
    setSavingName(true);
    const r = await updateGroupName(group.id, name);
    setSavingName(false);
    if (r?.error) setError(r.error);
    else router.refresh();
  }

  async function onRemove(userId) {
    setMenuFor(null);
    setBusy(true);
    const r = await removeMember(group.id, userId);
    setBusy(false);
    if (r?.error) setError(r.error);
    else router.refresh();
  }

  async function onTransfer(newLeaderId) {
    setBusy(true);
    const r = await transferLeadership(group.id, newLeaderId);
    setBusy(false);
    if (r?.error) { setError(r.error); return; }
    setChoice(null);
    router.refresh();
  }

  async function onLeave() {
    setBusy(true);
    const r = await leaveGroup(group.id);
    setBusy(false);
    if (r?.error) { setError(r.error); return; }
    router.push("/teams");
  }

  return (
    <div className="mt-5 flex flex-col gap-5 px-6">
      <AvatarUpload url={photoUrl} onChange={onPhotoChange} />

      {/* group name */}
      <div>
        <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">Group name</p>
        <div className="flex items-center gap-2 rounded-2xl bg-[#f3f1f8] px-4 py-3">
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} className="flex-1 bg-transparent text-[14px] font-semibold text-navy focus:outline-none" />
          {savingName && <span className="text-[11px] text-muted">Saving…</span>}
        </div>
      </div>

      {/* members */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-bold text-navy">Members ({members.length}/{group.max_members || "–"})</p>
          {isLeader && <Link href={`/groups/${group.id}/invite`} className="text-[12px] font-bold text-purple-600">+ Invite</Link>}
        </div>
        <div className="flex flex-col gap-2">
          {members.map((m, i) => (
            <div key={m.userId} className="relative flex items-center justify-between rounded-2xl bg-[#f3f1f8] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: AVATAR[i % AVATAR.length] }}>
                  {(m.name || "?").slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-navy">{m.name}{m.userId === meId ? " (You)" : ""}</p>
                  <p className="text-[11px] text-muted">{m.role === "leader" ? "Group Leader" : "Member"}</p>
                </div>
              </div>
              {isLeader && m.userId !== meId && (
                <>
                  <button type="button" onClick={() => setMenuFor(menuFor === m.userId ? null : m.userId)} className="px-2 text-[18px] font-bold text-muted">⋯</button>
                  {menuFor === m.userId && (
                    <div className="absolute right-2 top-12 z-10 w-44 rounded-xl border border-line bg-white p-1.5 shadow-card">
                      <button type="button" disabled={busy} onClick={() => onTransfer(m.userId)} className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-navy hover:bg-[#f3f1f8]">Make leader</button>
                      <button type="button" disabled={busy} onClick={() => onRemove(m.userId)} className="w-full rounded-lg px-3 py-2 text-left text-[13px] font-semibold" style={{ color: "#bf4247" }}>Remove from group</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-[13px] font-medium" style={{ color: "#bf4247" }}>{error}</p>}

      {/* danger zone */}
      <div className="mt-4 flex flex-col gap-3">
        {isLeader && (
          <button type="button" onClick={() => router.push(`/groups/${group.id}/end`)} className="w-full rounded-2xl py-3 text-[13px] font-semibold" style={{ background: "#fae0e0", color: "#bf4247" }}>End Project</button>
        )}
        <button
          type="button"
          onClick={() => setChoice(isLeader ? "transfer" : "confirmLeave")}
          className="w-full rounded-2xl py-3 text-[13px] font-semibold"
          style={{ background: "#fae0e0", color: "#bf4247" }}
        >
          Leave Group
        </button>
      </div>

      {/* leader tries to leave: must transfer or end instead — no direct leave allowed */}
      {choice === "transfer" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setChoice(null)}>
          <div className="mx-auto w-[402px] rounded-t-3xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <p className="mb-1 text-[16px] font-bold text-navy">You're the group leader</p>
            <p className="mb-4 text-[13px] text-muted">Transfer leadership to a teammate before you leave, or end the project instead.</p>
            {others.length === 0 ? (
              <p className="mb-3 text-[13px] text-muted">No other members to hand leadership to — end the project instead.</p>
            ) : (
              <div className="mb-3 flex flex-col gap-2">
                {others.map((m) => (
                  <button key={m.userId} type="button" disabled={busy} onClick={() => onTransfer(m.userId)} className="rounded-xl bg-[#f3f1f8] py-3 text-[14px] font-semibold text-navy">Make {m.name} leader</button>
                ))}
              </div>
            )}
            <button type="button" onClick={() => router.push(`/groups/${group.id}/end`)} className="w-full rounded-xl py-3 text-[14px] font-bold" style={{ background: "#fae0e0", color: "#bf4247" }}>End Project instead</button>
            <button type="button" onClick={() => setChoice(null)} className="mt-2 w-full py-2 text-[14px] font-semibold text-muted">Cancel</button>
          </div>
        </div>
      )}

      {choice === "confirmLeave" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setChoice(null)}>
          <div className="mx-auto w-[402px] rounded-t-3xl bg-white p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <p className="mb-1 text-[16px] font-bold text-navy">Leave this group?</p>
            <p className="mb-4 text-[13px] text-muted">You'll need a new invite or join request to get back in.</p>
            <button type="button" disabled={busy} onClick={onLeave} className="w-full rounded-xl py-3 text-[14px] font-bold text-white" style={{ background: "#bf4247" }}>{busy ? "Leaving…" : "Leave Group"}</button>
            <button type="button" onClick={() => setChoice(null)} className="mt-2 w-full py-2 text-[14px] font-semibold text-muted">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
