"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sendMessage, sendDM } from "@/app/chat/actions";

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const FACE_COLOURS = ["#FBBF24", "#4AC7B2", "#F2A5BD", "#A78BFA", "#9496F4"];

/** Circular face tile — the placeholder used everywhere a person has no photo. */
function Face({ size, colour, url, ring = false, style = {} }) {
  const s = { width: size, height: size, borderRadius: 9999, flexShrink: 0, ...(ring ? { border: "2px solid #fff" } : {}), ...style };
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" style={{ ...s, objectFit: "cover" }} />;
  }
  const eye = size * 0.1375;
  return (
    <span style={{ ...s, position: "relative", background: colour, display: "block" }}>
      <span style={{ position: "absolute", left: size * 0.18, top: size * 0.39, width: eye, height: eye, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: size * 0.68, top: size * 0.39, width: eye, height: eye, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: size * 0.365, top: size * 0.59, width: size * 0.27, height: size * 0.068, borderRadius: 9999, background: "#fff" }} />
    </span>
  );
}

export default function ChatView({
  groupId,
  conversationId,
  title,
  subtitle,
  infoHref,
  avatars = [],
  meId,
  messages = [],
  backHref = "/teams",
}) {
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

  const titleBlock = (
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#1D1B44", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
      {subtitle && <p style={{ fontSize: 10.5, color: "#757080", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}{infoHref ? " ›" : ""}</p>}
    </div>
  );

  return (
    <div className="flex h-full w-[402px] flex-col" style={{ background: "#F9F8FB" }}>
      {/* Header. Group Info is reached by tapping the title block — the Figma
          frame has no separate gear icon, the subtitle carries the chevron. */}
      <div style={{ height: 100, background: "#fff", borderBottom: "1px solid #F3F1F8", display: "flex", alignItems: "center", gap: 11, padding: "48px 16px 12px 24px" }}>
        <Link href={backHref} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: "#F3F1F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44", flexShrink: 0 }}>‹</Link>

        {avatars.length > 0 && (
          <span style={{ display: "flex", flexShrink: 0 }}>
            {avatars.slice(0, 3).map((a, i) => (
              <Face key={i} size={avatars.length === 1 ? 44 : 40} colour={a.colour || FACE_COLOURS[i % FACE_COLOURS.length]} url={a.url} ring={avatars.length > 1} style={i > 0 ? { marginLeft: -18 } : {}} />
            ))}
          </span>
        )}

        {infoHref ? <Link href={infoHref} style={{ minWidth: 0, flex: 1 }}>{titleBlock}</Link> : <div style={{ minWidth: 0, flex: 1 }}>{titleBlock}</div>}
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col overflow-y-auto" style={{ padding: "28px 24px", gap: 18 }}>
        {messages.length === 0 ? (
          <div style={{ marginTop: 60, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ position: "relative", width: 300, height: 300 }}>
              <div style={{ position: "absolute", background: "#FFB800", left: 110.7, top: 147.5, width: 118, height: 88.5 }} />
              <div style={{ position: "absolute", background: "#FFB800", left: 52.9, top: 79.9, width: 104.5, height: 104.5, borderRadius: 9999 }} />
              <div style={{ position: "absolute", background: "#111827", left: 132.8, top: 191.8, width: 11.1, height: 20.9, borderRadius: 9999 }} />
              <div style={{ position: "absolute", background: "#111827", left: 170.9, top: 191.8, width: 11.1, height: 20.9, borderRadius: 9999 }} />
              <div style={{ position: "absolute", background: "#C2410C", left: 167.4, top: 219.2, width: 10, height: 21.9, borderRadius: 9999, transform: "rotate(90deg)" }} />
            </div>
            <p style={{ marginTop: 16, fontSize: 19, fontWeight: 800, color: "#1D1B44" }}>Say hello!</p>
            <p style={{ marginTop: 10, fontSize: 12.5, color: "#757080" }}>This is the start of your conversation.</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.sender_id === meId;
            // Only label a run of messages once, the way the frame does.
            const startsRun = i === 0 || messages[i - 1].sender_id !== m.sender_id;
            if (mine) {
              return (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ maxWidth: 260, background: "linear-gradient(90deg, #7C3AED 0%, #6D28D9 100%)", color: "#fff", fontSize: 12.5, lineHeight: "19px", padding: "13px 16px", borderRadius: 16, borderBottomRightRadius: 6 }}>{m.body}</div>
                  <p suppressHydrationWarning style={{ marginTop: 6, fontSize: 10.5, color: "#757080" }}>{fmtTime(m.created_at)}</p>
                </div>
              );
            }
            return (
              <div key={m.id}>
                {startsRun && m.name && <p style={{ marginLeft: 30, marginBottom: 6, fontSize: 10, fontWeight: 600, color: "#757080" }}>{m.name}</p>}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                  <Face size={25} colour={FACE_COLOURS[(m.sender_id || "").charCodeAt(0) % FACE_COLOURS.length || 0]} url={m.avatarUrl} style={{ visibility: startsRun ? "visible" : "hidden" }} />
                  <div>
                    <div style={{ maxWidth: 260, background: "#F3F1F8", color: "#1D1B44", fontSize: 12.5, lineHeight: "19px", padding: "13px 16px", borderRadius: 16, borderBottomLeftRadius: 6 }}>{m.body}</div>
                    <p suppressHydrationWarning style={{ marginTop: 6, fontSize: 10.5, color: "#757080" }}>{fmtTime(m.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <form onSubmit={send} style={{ height: 90, background: "#fff", boxShadow: "0px -2px 12px rgba(25,20,51,0.06)", display: "flex", alignItems: "center", gap: 8, padding: "0 22px" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, height: 48, borderRadius: 24, background: "#F3F1F8", padding: "0 18px", fontSize: 12.5, color: "#1D1B44", outline: "none" }}
        />
        <button type="submit" disabled={sending} aria-label="Send" style={{ width: 48, height: 48, borderRadius: 24, background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: sending ? 0.6 : 1 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
        </button>
      </form>
    </div>
  );
}
