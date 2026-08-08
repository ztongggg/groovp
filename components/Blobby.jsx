// Shared "Blobby" mascot (orange/red arch, 2 eyes, 1 mouth) used on every
// celebration screen (Signup Complete, Request Sent Confirmation, Create
// Project Congrats). Percentage-based so a single `size` scales it cleanly —
// collapses what used to be 3 independently-coded, slightly-drifted copies
// (SignupForm.jsx, RequestButton.jsx, app/create/page.jsx) into one.
export default function Blobby({ size = 300 }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute" style={{ background: "#ff4625", inset: "25.33% 30.67% 25.33% 31.33%", borderTopLeftRadius: size * 0.187, borderTopRightRadius: size * 0.187, borderBottomLeftRadius: size * 0.033, borderBottomRightRadius: size * 0.033 }} />
      <div className="absolute rounded-full" style={{ background: "#071a3d", left: "33.77%", top: "39.11%", width: "3.11%", height: "3.11%" }} />
      <div className="absolute rounded-full" style={{ background: "#071a3d", left: "51.56%", top: "39.11%", width: "3.11%", height: "3.11%" }} />
      <div className="absolute" style={{ background: "#6d1b2a", left: "40%", top: "49.33%", width: "8%", height: "4%", borderRadius: `0 0 ${size * 0.02}px ${size * 0.02}px` }} />
    </div>
  );
}
