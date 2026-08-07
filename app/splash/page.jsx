import Link from "next/link";

// Onboarding — Splash (Figma node 570:15147). Brand intro, tap anywhere to
// continue. Whole-screen tap target matches the Figma frame, which has no
// separate CTA button.
//
// All 5 mascots are now real exported assets (Shapey/Starry/Cloudy/Blobby/
// Marky), positioned at the exact coordinates from the HTML export — found by
// matching each PNG's own pixel dimensions against the export's 5 image
// placeholders, since dimensions disambiguate what z-order can't. Replaces an
// earlier hand-built composite of CSS shape divs + bump SVGs approximating
// the same 5 faces.
export default function SplashPage() {
  return (
    <Link href="/login" className="relative block w-[402px] bg-white" style={{ height: 874 }}>
      <p className="absolute" style={{ left: 32, top: 90, fontSize: 40, fontWeight: 800, color: "#1e1b4b" }}>Groovp</p>
      <div className="absolute" style={{ left: 32, top: 150, width: 300, fontSize: 15, color: "#59546b", lineHeight: "22px" }}>
        <p>Find teammates who actually fit.</p>
        <p>Built for students.</p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-shapey.png" alt="" className="absolute" style={{ left: 8, top: 307, width: 174, height: 200 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-starry.png" alt="" className="absolute" style={{ left: 208.18, top: 367, width: 200, height: 200, transform: "rotate(1deg)" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-cloudy.png" alt="" className="absolute" style={{ left: 77, top: 519, width: 200, height: 200 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-blobby.png" alt="" className="absolute" style={{ left: 19, top: 677, width: 187, height: 200 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/splash-marky.png" alt="" className="absolute" style={{ left: 206, top: 677, width: 196, height: 197 }} />
    </Link>
  );
}
