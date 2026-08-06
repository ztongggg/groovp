"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendMessage, sendDM } from "@/app/chat/actions";

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatView({ groupId, conversationId, title, meId, messages = [], backHref = "/teams" }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function send(e) {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    const res = conversationId ? await sendDM(conversationId, body) : await sendMessage(groupId, body);
    setSending(false);
    if (res?.error) {
      setText(body);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex h-full w-[402px] flex-col bg-bgapp">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-line bg-white px-5 py-4">
        <Link href={backHref} className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
        <p className="flex-1 text-[17px] font-bold text-navy">{title}</p>
        {groupId && (
          <Link href={`/groups/${groupId}`} aria-label="Group info" className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#f3f1f8" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
          </Link>
        )}
      </div>

      {/* messages */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="relative" style={{ width: 180, height: 180 }}>
              <div className="absolute rounded-full" style={{ background: "#f29c38", left: 40, top: 0, width: 100, height: 100 }} />
              <div className="absolute" style={{ background: "#f29c38", left: 20, top: 70, width: 140, height: 90, borderTopLeftRadius: 60, borderTopRightRadius: 60 }} />
              <div className="absolute rounded-full" style={{ background: "#111827", left: 68, top: 105, width: 14, height: 14 }} />
              <div className="absolute rounded-full" style={{ background: "#111827", left: 98, top: 105, width: 14, height: 14 }} />
              <div className="absolute" style={{ background: "#c2410c", left: 82, top: 125, width: 16, height: 9, borderRadius: 6 }} />
            </div>
            <p className="mt-2 text-[16px] font-extrabold text-navy">Say hello!</p>
            <p className="mt-1 text-[13px] text-muted">This is the start of your conversation.</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === meId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%]">
                  {!mine && <p className="mb-0.5 pl-3 text-[11px] font-semibold text-muted">{m.name}</p>}
                  <div
                    className="rounded-2xl px-4 py-2.5 text-[14px]"
                    style={mine ? { background: "#7c3aed", color: "#fff", borderBottomRightRadius: 6 } : { background: "#fff", color: "#1d1b44", border: "1px solid #f0edf5", borderBottomLeftRadius: 6 }}
                  >
                    {m.body}
                  </div>
                  <p className={`mt-1 text-[10.5px] text-muted ${mine ? "text-right pr-1" : "pl-3"}`}>{fmtTime(m.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* input */}
      <form onSubmit={send} className="flex items-center gap-2 border-t border-line bg-white px-4 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full bg-bgapp px-4 py-3 text-[14px] text-navy focus:outline-none"
        />
        <button type="submit" disabled={sending} className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: "#7c3aed" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
        </button>
      </form>
    </div>
  );
}
