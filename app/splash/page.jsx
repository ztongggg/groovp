import Link from "next/link";
import StatusBar from "@/components/StatusBar";

// Onboarding — Splash (Figma node 570:15147). Brand intro, tap anywhere to continue.
// Whole-screen tap target matches the Figma frame, which has no separate CTA button.
export default function SplashPage() {
  return (
    <Link href="/login" className="relative block w-[402px] bg-white" style={{ height: 874 }}>
      <div className="absolute inset-x-0 top-0"><StatusBar /></div>

      <p className="absolute" style={{ left: 32, top: 90, fontSize: 40, fontWeight: 800, color: "#1e1b4b" }}>Groovp</p>
      <div className="absolute" style={{ left: 32, top: 150, width: 300, fontSize: 15, color: "#59546b", lineHeight: "22px" }}>
        <p>Find teammates who actually fit.</p>
        <p>Built for students.</p>
      </div>

      {/* Shapey */}
      <div className="absolute" style={{ left: -26, top: 367, width: 200, height: 200 }}>
        <div className="absolute flex items-center justify-center" style={{ left: 59.47, top: 99.7, width: 83.787, height: 68.661 }}>
          <div style={{ transform: "rotate(169.78deg)", background: "#ffb800", width: 74.999, height: 56.249, borderTopLeftRadius: 70.312, borderTopRightRadius: 70.312 }} />
        </div>
        <div className="absolute flex items-center justify-center" style={{ left: 116.08, top: 162.87, width: 66.406, height: 66.406 }}>
          <div className="rounded-full" style={{ background: "#ffb800", width: 66.406, height: 66.406 }} />
        </div>
        <div className="absolute rounded-full" style={{ background: "#111827", left: 141.02, top: 197.35, width: 7.463, height: 14.096 }} />
        <div className="absolute rounded-full" style={{ background: "#111827", left: 175.12, top: 197.35, width: 7.463, height: 14.096 }} />
        <div className="absolute flex items-center justify-center" style={{ left: 120.89, top: 168.65, width: 14.593, height: 6.633 }}>
          <div className="rounded-full" style={{ transform: "rotate(90deg)", background: "#c2410c", width: 6.633, height: 14.593 }} />
        </div>
      </div>

      {/* Marky */}
      <div className="absolute" style={{ left: 206, top: 677, width: 200, height: 200 }}>
        <div className="absolute" style={{ background: "#2ed573", left: 30.67, top: 112, width: 66.667, height: 52, borderTopLeftRadius: 60 }} />
        <div className="absolute" style={{ background: "#2ed573", left: 89.33, top: 34.67, width: 80, height: 129.333, borderTopRightRadius: 60 }} />
        <div className="absolute rounded-full" style={{ background: "#0b2a5b", left: 46.67, top: 138.67, width: 12, height: 12 }} />
        <div className="absolute rounded-full" style={{ background: "#0b2a5b", left: 73.33, top: 138.67, width: 12, height: 12 }} />
        <div className="absolute rounded-full" style={{ background: "#115e59", left: 36, top: 156, width: 22.667, height: 5.333 }} />
      </div>

      {/* Starry */}
      <div className="absolute" style={{ left: 182, top: 330, width: 200, height: 200 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/splash-starry-star.svg" alt="" className="absolute" style={{ left: 5.33, top: 5.33, width: 189.333, height: 189.333 }} />
        <div className="absolute rounded-full" style={{ background: "#111827", left: 72, top: 88, width: 14.667, height: 14.667 }} />
        <div className="absolute rounded-full" style={{ background: "#111827", left: 112, top: 88, width: 14.667, height: 14.667 }} />
        <div className="absolute rounded-full" style={{ background: "#be185d", left: 96, top: 105.33, width: 9.333, height: 8 }} />
      </div>

      {/* Blobby */}
      <div className="absolute" style={{ left: -13, top: 628, width: 200, height: 200 }}>
        <div className="absolute" style={{ background: "#ff4625", inset: "25.33% 30.67% 25.33% 31.33%", borderTopLeftRadius: 37.333, borderTopRightRadius: 37.333, borderBottomLeftRadius: 6.667, borderBottomRightRadius: 6.667 }} />
        <div className="absolute" style={{ background: "#6d1b2a", inset: "49.33% 45.33% 45.33% 46.67%", borderTopLeftRadius: 6.667, borderTopRightRadius: 6.667, borderBottomLeftRadius: 37.333, borderBottomRightRadius: 37.333 }} />
        <div className="absolute rounded-full" style={{ background: "#071a3d", left: 101.33, top: 117.33, width: 9.333, height: 9.333 }} />
        <div className="absolute rounded-full" style={{ background: "#071a3d", left: 154.67, top: 117.33, width: 9.333, height: 9.333 }} />
      </div>

      {/* Cloudy */}
      <div className="absolute overflow-hidden" style={{ left: 116, top: 523, width: 200, height: 200 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/splash-cloudy-bump-a.svg" alt="" className="absolute" style={{ left: 78.22, top: 80, width: 49.333, height: 49.333 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/splash-cloudy-bump-a.svg" alt="" className="absolute" style={{ left: 124.44, top: 80, width: 49.333, height: 49.333 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/splash-cloudy-bump-b.svg" alt="" className="absolute" style={{ left: 124.44, top: 120.89, width: 49.333, height: 48 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/splash-cloudy-bump-a.svg" alt="" className="absolute" style={{ left: 80, top: 124.44, width: 49.333, height: 49.333 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/splash-cloudy-bump-c.svg" alt="" className="absolute" style={{ left: 69.33, top: 113.78, width: 29.333, height: 29.333 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/splash-cloudy-bump-d.svg" alt="" className="absolute" style={{ left: 113.78, top: 69.33, width: 28, height: 29.333 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/splash-cloudy-bump-c.svg" alt="" className="absolute" style={{ left: 160, top: 115.56, width: 29.333, height: 29.333 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/splash-cloudy-bump-c.svg" alt="" className="absolute" style={{ left: 119.11, top: 160, width: 29.333, height: 29.333 }} />
        <div className="absolute rounded-full" style={{ background: "#0b2a5b", left: 106.67, top: 122.67, width: 11.487, height: 14.667 }} />
        <div className="absolute rounded-full" style={{ background: "#0b2a5b", left: 148.24, top: 122.67, width: 11.487, height: 14.667 }} />
        <div className="absolute rounded-full" style={{ background: "#1d4ed8", left: 129.78, top: 151.11, width: 6.667, height: 9.333 }} />
      </div>
    </Link>
  );
}
