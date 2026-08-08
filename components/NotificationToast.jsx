"use client";

// Pops a toast when a new notification arrives, instead of it only ever
// showing up silently on the bell icon. Lightweight poll (not Supabase
// Realtime — no extra project config needed to ship this). Mounted for every
// signed-in user; getLatestNotification() is a no-op when signed out.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getLatestNotification } from "@/lib/notifications";

export default function NotificationToast() {
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const seenId = useRef(null);
  const primed = useRef(false);
  const dismissTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const latest = await getLatestNotification().catch(() => null);
      if (cancelled || !latest) return;

      if (!primed.current) {
        // First tick just establishes the baseline — don't toast whatever
        // was already sitting there before this page loaded.
        primed.current = true;
        seenId.current = latest.id;
        return;
      }

      if (latest.id !== seenId.current) {
        seenId.current = latest.id;
        setToast(latest);
        clearTimeout(dismissTimer.current);
        dismissTimer.current = setTimeout(() => setToast(null), 5000);
      }
    }
    poll();
    const iv = setInterval(poll, 8000);
    return () => {
      cancelled = true;
      clearInterval(iv);
      clearTimeout(dismissTimer.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setToast(null);
        router.push("/notifications");
      }}
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        right: 24,
        zIndex: 9998,
        textAlign: "left",
        padding: "14px 16px",
        borderRadius: 16,
        background: "#1D1B44",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.4,
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      🔔 {toast.body}
    </button>
  );
}
