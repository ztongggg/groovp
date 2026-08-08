// Shared "Blobby" mascot used on every celebration screen (Signup Complete,
// Request Sent Confirmation, Create Project Congrats). The fresh 2026-08-09
// Figma exports ship a real Blobby.png in every one of those folders
// (byte-identical across all 4, confirmed via md5) — using that literal
// asset instead of a hand-coded CSS-shape approximation, since owner
// feedback was that the CSS-shape rebuild wasn't matching. Copied once to
// public/blobby-mascot.png (transparent PNG, 300x300 native).
export default function Blobby({ size = 300 }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/blobby-mascot.png" alt="" width={size} height={size} />;
}
