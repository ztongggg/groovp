import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import DiscoverList from "@/components/DiscoverList";
import TutorialOverlay from "@/components/TutorialOverlay";
import { createClient } from "@/lib/supabase/server";
import { getDiscoverItems } from "@/lib/discoverData";

async function getData() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return await getDiscoverItems(supabase, user?.id);
  } catch {
    return [];
  }
}

export default async function Tutorial5Page() {
  const items = await getData();
  return (
    <div className="relative">
      <AppShell>
        <div className="min-h-full bg-white pb-6">
          <StatusBar />
          <div className="flex items-center justify-between px-6">
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Discover</h1>
            <div className="flex items-center gap-2">
              <span className="rounded-full px-3 py-1.5 text-[12px] font-bold text-purple-600" style={{ background: "#ece8fc" }}>Join with code</span>
              <span className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#7c3aed" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
            </div>
          </div>
          {items.length > 0 && <DiscoverList items={items} />}
        </div>
      </AppShell>
      <TutorialOverlay
        step={5}
        spotlight={{ top: 96, left: 346, width: 32, height: 32, borderRadius: 16 }}
        title="Have your own idea?"
        body="Tap here to start your own project and recruit a team."
        backHref="/tutorial/4"
        nextHref="done"
        nextLabel="Get Started"
      />
    </div>
  );
}
