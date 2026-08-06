import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import DiscoverList from "@/components/DiscoverList";
import { createClient } from "@/lib/supabase/server";
import { getDiscoverItems } from "@/lib/discoverData";

// Resilient: on any failure (e.g. local corp-proxy TLS) return [] so the page
// still renders. Real data loads on Vercel.
async function getData() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return await getDiscoverItems(supabase, user?.id);
  } catch {
    return [];
  }
}

export default async function DiscoverPage() {
  const items = await getData();

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <StatusBar />

        {/* Header */}
        <div className="flex items-center justify-between px-6">
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Discover</h1>
          <div className="flex items-center gap-2">
            <Link href="/join" className="rounded-full px-3 py-1.5 text-[12px] font-bold text-purple-600" style={{ background: "#ece8fc" }}>Join with code</Link>
            <Link href="/create" aria-label="Create project" className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#7c3aed" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </Link>
          </div>
        </div>

        {/* Projects */}
        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center px-8 text-center">
            <p className="text-[16px] font-semibold text-navy">No projects yet</p>
            <p className="mt-1 text-[14px] text-muted">Be the first to create one.</p>
            <Link href="/create" className="mt-5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 text-[15px] font-bold text-white">
              Create a project
            </Link>
          </div>
        ) : (
          <DiscoverList items={items} />
        )}
      </div>
    </AppShell>
  );
}
