"use client";

import { useState } from "react";
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
    <div style={{ marginTop: 26, padding: "0 24px", display: "flex", flexDirection: "column", gap: 24 }}>
      <AvatarUpload url={photoUrl} onChange={onPhotoChange} caption="Change group photo" />

      {/* Group name — a single tappable row, not a labelled field. */}
      <div style={{ height: 52, background: "#F3F1F8", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, padding: "0 16px" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} className="flex-1 bg-transparent focus:outline-none" style={{ fontSize: 14, fontWeight: 600, color: "#1D1B44" }} />
        {savingName ? (
          <span style={{ fontSize: 11, color: "#757080" }}>Saving…</span>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1D1B44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" /><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" /></svg>
        )}
      </div>

      {/* Members */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1D1B44" }}>Members ({members.length}/{group.max_members || "–"})</p>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {members.map((m, i) => (
            <div key={m.userId} style={{ position: "relative", height: 60, background: "#F3F1F8", borderRadius: 14, display: "flex", alignItems: "center", gap: 12, padding: "0 8px" }}>
              <span style={{ position: "relative", width: 44, height: 44, borderRadius: 9999, background: AVATAR[i % AVATAR.length], flexShrink: 0, display: "block" }}>
                <span style={{ position: "absolute", left: 8, top: 17, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
                <span style={{ position: "absolute", left: 30, top: 17, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
                <span style={{ position: "absolute", left: 16, top: 26, width: 12, height: 3, borderRadius: 9999, background: "#fff" }} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>{m.name}{m.userId === meId ? " (You)" : ""}</p>
                <p style={{ fontSize: 11, color: "#757080", marginTop: 3 }}>{m.role === "leader" ? "Group Leader" : "Member"}</p>
              </div>
              {isLeader && m.userId !== meId && (
                <>
                  <button type="button" onClick={() => setMenuFor(menuFor === m.userId ? null : m.userId)} aria-label={`Options for ${m.name}`} style={{ padding: "0 8px", fontSize: 18, fontWeight: 700, color: "#757080" }}>⋯</button>
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

      {/* Danger zone */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {isLeader && (
          <button type="button" onClick={() => router.push(`/groups/${group.id}/end`)} style={{ height: 50, borderRadius: 14, background: "#FAE0E0", color: "#BF4247", fontSize: 13, fontWeight: 600 }}>End Project</button>
        )}
        <button
          type="button"
          onClick={() => setChoice(isLeader ? "transfer" : "confirmLeave")}
          style={{ height: 50, borderRadius: 14, background: "#FAE0E0", color: "#BF4247", fontSize: 13, fontWeight: 600 }}
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
