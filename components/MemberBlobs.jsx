// Member avatar blobs as the Figma file builds them: a coloured circle with two
// white eyes and a mouth, overlapping slightly, cycling through four fills.
const BLOB = ["#f29c38", "#4ac7b2", "#f2a5bd", "#b1b4ed"];

export default function MemberBlobs({ count = 0, size = 19, max = 4 }) {
  const n = Math.max(0, Math.min(max, count));
  // Figma's eye/mouth geometry is drawn at 19px and 23px; scale from the 19px one.
  const k = size / 19;
  const eye = 2 * k;
  const eyeTop = 9 * k;
  const mouthW = 3 * k;
  const mouthTop = 12 * k;

  return (
    <div className="flex">
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className="relative inline-block shrink-0 rounded-full"
          style={{ width: size, height: size, background: BLOB[i % BLOB.length], marginLeft: i === 0 ? 0 : -size * 0.26 }}
        >
          <span className="absolute rounded-full bg-white" style={{ left: 6 * k, top: eyeTop, width: eye, height: eye }} />
          <span className="absolute rounded-full bg-white" style={{ left: 12 * k, top: eyeTop, width: eye, height: eye }} />
          <span className="absolute bg-white" style={{ left: 8 * k, top: mouthTop, width: mouthW, height: Math.max(1, k), borderRadius: 0.63 }} />
        </span>
      ))}
    </div>
  );
}
