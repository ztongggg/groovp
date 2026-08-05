"use client";

import { useState } from "react";

export default function PreferenceToggle({ label, sub, initial, onSave }) {
  const [on, setOn] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function flip() {
    const next = !on;
    setOn(next);
    setSaving(true);
    const r = await onSave(next);
    setSaving(false);
    if (r?.error) setOn(!next); // revert on failure
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-line bg-white p-4">
      <div className="min-w-0 pr-3">
        <p className="text-[15px] font-bold text-navy">{label}</p>
        {sub && <p className="mt-0.5 text-[12.5px] text-muted">{sub}</p>}
      </div>
      <button type="button" onClick={flip} disabled={saving} className="relative shrink-0 h-7 w-12 rounded-full transition-colors disabled:opacity-60" style={{ background: on ? "#7c3aed" : "#d6d3de" }}>
        <span className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all" style={{ left: on ? 24 : 4 }} />
      </button>
    </div>
  );
}
