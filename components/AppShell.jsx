import BottomNav from "@/components/BottomNav";

// Mobile app frame: iPhone-width (402px) centered column with the bottom nav.
// Pages provide their own inner padding (some screens are full-bleed).
export default function AppShell({ children, nav = true }) {
  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-[402px] flex-col bg-bgapp">
      <div className="flex-1">{children}</div>
      {nav && <BottomNav />}
    </div>
  );
}
