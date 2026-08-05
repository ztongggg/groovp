"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendMessage, sendDM } from "@/app/chat/actions";

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
        <Link href={backHref} className="text-[22px] text-navy">‹</Link>
        <p className="flex-1 text-[17px] font-bold text-navy">{title}</p>
        {groupId && (
          <Link href={`/groups/${groupId}/edit`} aria-label="Group settings" className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "#f3f1f8" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
          </Link>
        )}
      </div>

      {/* messages */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="mt-10 text-center text-[14px] text-muted">No messages yet. Say hi 👋</p>
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
