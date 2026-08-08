// Shared confetti scatter for celebration screens. Figma's fresh exports
// (2026-08-09) show the exact same 10-piece pattern reused verbatim across
// Signup Complete / Request Sent Confirmation (CONFETTI_HIGH), and shifted
// by a constant (-8,-47)px for Create Project Congrats (CONFETTI_LOW) — two
// literal sets, not a formula, since that's genuinely all Figma authored.
//
// One piece's real color is #DCF674 (lime) in every export. Per an earlier
// owner-directed app-wide pass ("every #DCF674 replaced with #7C3AED", see
// HANDOFF 2026-08-08 design polish batch) that color is deliberately banned
// app-wide — overridden to #7C3AED here too rather than reintroducing it.
const PIECE = (l, t, w, h, r, bg, rot) => ({ l, t, w, h, r, bg, rot });

export const CONFETTI_HIGH = [
  PIECE(70, 270, 50, 16, 8, "#F29C38", -35),
  PIECE(282, 270, 50, 16, 8, "#F29C38", 35),
  PIECE(40, 170, 18, 18, 9999, "#F2A5BD"),
  PIECE(340, 200, 16, 16, 4, "#7C3AED", -20),
  PIECE(330, 430, 14, 14, 9999, "#B1B4ED"),
  PIECE(365, 315, 10, 10, 9999, "#7C3AED"),
  PIECE(56, 396, 8, 8, 9999, "#7C3AED"), // was #DCF674 (lime) in the export — banned app-wide, see comment above
  PIECE(83, 467.5, 14, 5, 3, "#F472B6", -30),
  PIECE(344, 467.5, 12, 5, 3, "#7C3AED", 20),
  PIECE(196, 156, 8, 8, 9999, "#F472B6"),
];

export const CONFETTI_LOW = [
  PIECE(62, 223, 50, 16, 8, "#F29C38", -35),
  PIECE(274, 223, 50, 16, 8, "#F29C38", 35),
  PIECE(32, 123, 18, 18, 9999, "#F2A5BD"),
  PIECE(332, 153, 16, 16, 4, "#7C3AED", -20),
  PIECE(322, 383, 14, 14, 9999, "#B1B4ED"),
  PIECE(357, 268, 10, 10, 9999, "#7C3AED"),
  PIECE(48, 349, 8, 8, 9999, "#7C3AED"), // was #DCF674 (lime) — banned app-wide, see comment above
  PIECE(75, 420.5, 14, 5, 3, "#F472B6", -30),
  PIECE(336, 420.5, 12, 5, 3, "#7C3AED", 20),
  PIECE(188, 109, 8, 8, 9999, "#F472B6"),
];

export default function Confetti({ pieces }) {
  return pieces.map((c, i) => (
    <span key={i} className="absolute" style={{ left: c.l, top: c.t, width: c.w, height: c.h, borderRadius: c.r, background: c.bg, transform: c.rot ? `rotate(${c.rot}deg)` : undefined }} />
  ));
}
