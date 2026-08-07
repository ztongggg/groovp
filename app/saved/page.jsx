import Link from "next/link";
import AppShell from "@/components/AppShell";
import DiscoverCard from "@/components/DiscoverCard";
import { createClient } from "@/lib/supabase/server";
import { getDiscoverItems } from "@/lib/discoverData";

// Saved Projects reuses the exact same card as Discover — the export shows the
// identical 334x357 tile (cover photo, skill chips, member blobs, Request
// button), not a plain text list.
async function getSaved() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: favs } = await supabase.from("project_favorites").select("project_id").eq("user_id", user.id);
    const savedIds = new Set((favs || []).map((f) => f.project_id));
    if (!savedIds.size) return [];
    const items = await getDiscoverItems(supabase, user.id);
    return items.filter((i) => savedIds.has(i.id));
  } catch {
    return [];
  }
}

export default async function SavedPage() {
  const projects = await getSaved();

  return (
    <AppShell>
      <div className="font-nunito min-h-full bg-white pb-6">
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 24px" }}>
          <Link href="/home" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }}>‹</Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1E1B4B" }}>Saved Projects</h1>
        </div>

        {projects.length === 0 ? (
          <div className="mt-24 px-8 text-center">
            <p className="text-[16px] font-semibold text-navy">Nothing saved yet</p>
            <p className="mt-1 text-[14px] text-muted">Tap the heart on a project to save it here.</p>
          </div>
        ) : (
          <div className="px-[30px]" style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 20 }}>
            {projects.map((p) => (
              <DiscoverCard
                key={p.id}
                title={p.title}
                desc={p.desc}
                skills={p.skills}
                memberCount={p.memberCount}
                count={p.count}
                date={p.date}
                groupId={p.groupId}
                projectId={p.id}
                strongMatch={p.strongMatch}
                coverImageUrl={p.coverImageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
