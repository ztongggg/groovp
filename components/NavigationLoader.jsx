"use client";

// app/loading.jsx (Next's route-segment Suspense boundary) only shows when a
// navigation's server fetch is slow enough to notice — but <Link> prefetches
// in the background by default, so most clicks land instantly with nothing
// to show. This shows immediately on click intent instead, and clears once
// the route actually changes — visible on every navigation, not just slow ones.

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // Route actually changed — navigation landed, hide the loader.
  useEffect(() => {
    setLoading(false);
    clearTimeout(timeoutRef.current);
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest("a");
      if (!link) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathnameRef.current && !url.search) return; // no-op link

      setLoading(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setLoading(false), 6000); // safety net if navigation stalls
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.7)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "3px solid #EAE5FC",
          borderTopColor: "#7C3AED",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}
