"use client";

import { useRouter } from "next/navigation";

// Real "go back to wherever I actually came from" — every screen in this
// app used to hardcode a single guessed destination (e.g. a member's
// profile always said "back" meant /discover, even when you'd actually
// clicked in from Group Info, Saved, a notification, etc). That guess was
// wrong any time a screen had more than one real entry point. Browser
// history doesn't need to guess. `fallbackHref` only fires on the rare
// case there's no in-app history to go back to (e.g. a deep link opened
// fresh) — same destination those screens already used, so this only
// improves behavior, never regresses it.
export default function BackButton({ fallbackHref = "/home", ariaLabel = "Back", className, style, children = "‹" }) {
  const router = useRouter();

  function onClick() {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallbackHref);
  }

  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={className} style={style}>
      {children}
    </button>
  );
}
