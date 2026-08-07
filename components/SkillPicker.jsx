"use client";

import { useEffect, useState } from "react";
import { getSkillCatalog, addCustomSkill } from "@/app/skills/actions";
import { DEFAULT_SKILLS } from "@/lib/skillCatalog";

const DEFAULT_CHIP_ACTIVE = { background: "#7C3AED", color: "#fff", border: "1px solid transparent" };
const DEFAULT_CHIP_INACTIVE = { background: "#F3F1F8", color: "#1D1B44", border: "1px solid transparent" };

/**
 * Shared skill search+select control. Three things every skill picker in the
 * app needs, previously reimplemented slightly differently in six places:
 *   1. A user can type a skill that isn't in the list and add it — it becomes
 *      a real suggestion in the shared catalog for every other picker, not
 *      just a one-off local value.
 *   2. Only a handful of chips render at once (roughly 3 rows), not the
 *      entire catalog — searching narrows down to what's relevant instead of
 *      scrolling a wall of chips.
 *   3. Selected skills always stay visible/toggleable even if they'd
 *      otherwise fall outside the visible cap.
 */
export default function SkillPicker({
  selected = [],
  onChange,
  placeholder = "Find or add a skill",
  maxVisible = 9,
  chipActiveStyle = DEFAULT_CHIP_ACTIVE,
  chipInactiveStyle = DEFAULT_CHIP_INACTIVE,
}) {
  const [catalog, setCatalog] = useState(DEFAULT_SKILLS);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSkillCatalog().then((names) => {
      if (!cancelled) setCatalog((prev) => Array.from(new Set([...prev, ...names])));
    });
    return () => { cancelled = true; };
  }, []);

  const q = query.trim().toLowerCase();
  const isSelected = (name) => selected.some((s) => s.toLowerCase() === name.toLowerCase());
  const matches = (name) => !q || name.toLowerCase().includes(q);

  const filtered = catalog.filter(matches);
  const selectedFirst = [...selected.filter((s) => matches(s)), ...filtered.filter((n) => !isSelected(n))];
  const visible = Array.from(new Set(selectedFirst)).slice(0, maxVisible);

  const exactMatch = q && catalog.some((name) => name.toLowerCase() === q);

  function toggle(name) {
    onChange(isSelected(name) ? selected.filter((s) => s.toLowerCase() !== name.toLowerCase()) : [...selected, name]);
  }

  async function addAndSelect() {
    const clean = query.trim();
    if (!clean || adding) return;
    setAdding(true);
    setCatalog((prev) => Array.from(new Set([...prev, clean])));
    onChange([...selected, clean]);
    setQuery("");
    await addCustomSkill(clean);
    setAdding(false);
  }

  return (
    <div>
      <div style={{ height: 50, borderRadius: 25, background: "#F3F1F8", display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#757080" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && q && !exactMatch) { e.preventDefault(); addAndSelect(); } }}
          placeholder={placeholder}
          className="flex-1 bg-transparent focus:outline-none"
          style={{ fontSize: 13, color: "#1D1B44" }}
        />
      </div>

      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {visible.map((name) => {
          const active = isSelected(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              style={{ height: 32, borderRadius: 16, padding: "0 16px", fontSize: 11.5, fontWeight: active ? 700 : 400, ...(active ? chipActiveStyle : chipInactiveStyle) }}
            >
              {name}
            </button>
          );
        })}

        {q && !exactMatch && (
          <button
            type="button"
            onClick={addAndSelect}
            disabled={adding}
            style={{ height: 32, borderRadius: 16, padding: "0 16px", fontSize: 11.5, fontWeight: 700, background: "#ECE8FC", color: "#7C3AED", border: "1px dashed #7C3AED", opacity: adding ? 0.6 : 1 }}
          >
            + Add &ldquo;{query.trim()}&rdquo;
          </button>
        )}
      </div>
    </div>
  );
}
