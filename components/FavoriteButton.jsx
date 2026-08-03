"use client";

import { useState } from "react";
import { toggleFavorite } from "@/app/favorites/actions";

export default function FavoriteButton({ projectId, initial }) {
  const [fav, setFav] = useState(!!initial);
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    const next = !fav;
    setFav(next); // optimistic
    const res = await toggleFavorite(projectId, !next);
    if (res?.error) setFav(!next);
    setBusy(false);
  }

  return (
    <button onClick={onClick} aria-label={fav ? "Remove from saved" : "Save"} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
      <svg width="18" height="18" viewBox="0 0 24 24" fill={fav ? "#f472b6" : "none"} stroke={fav ? "#f472b6" : "#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z" />
      </svg>
    </button>
  );
}
