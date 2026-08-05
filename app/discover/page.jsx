import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import DiscoverList from "@/components/DiscoverList";
import { createClient } from "@/lib/supabase/server";
import { STRONG_MATCH_THRESHOLD } from "@/lib/matching";

function fmt(d) {
  if (!d) return "";
  const [y, m, day] = d.split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

const AVATAR_COLORS = ["#e8863b", "#34b9a8", "#f2a5bd", "#7c3aed"];

// Resilient: on any failure (e.g. local corp-proxy TLS) return [] so the page
// still renders. Real data loads on Vercel.
async function getData() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let mine = new Set();
    if (user) {
      const { data: p } = await supabase.from("profiles").select("skills, interests").eq("id", user.id).single();
      mine = new Set([...(p?.skills || []), ...(p?.interests || [])].map((s) => s.toLowerCase()));
    }

    const { data, error } = await supabase
      .from("projects")
      .select("id,name,description,skills_needed,interests,timeline_start,timeline_end,min_size,max_size,cover_image_url, groups(id, group_members(count))")
      .order("created_at", { ascending: false });
    if (error) return { projects: [], mine };
    return { projects: data || [], mine };
  } catch {
    return { projects: [], mine: new Set() };
  }
}

export default async function DiscoverPage() {
  const { projects, mine } = await getData();

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
        {projects.length === 0 ? (
          <div className="mt-16 flex flex-col items-center px-8 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/empty-search.png" alt="" className="mb-4 h-40 w-40" />
            <p className="text-[16px] font-semibold text-navy">No projects yet</p>
            <p className="mt-1 text-[14px] text-muted">Be the first to create one.</p>
            <Link href="/create" className="mt-5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 text-[15px] font-bold text-white">
              Create a project
            </Link>
          </div>
        ) : (
          <DiscoverList
            items={projects.map((p, i) => {
              const group = p.groups?.[0];
              const members = group?.group_members?.[0]?.count ?? 0;
              const tags = [...(p.skills_needed || []), ...(p.interests || [])];
              const shared = tags.filter((t) => mine.has((t || "").toLowerCase())).length;
              return {
                id: p.id,
                title: p.name,
                desc: p.description || "",
                skills: p.skills_needed || [],
                count: `${members}/${p.max_size || 0}`,
                date: `${fmt(p.timeline_start)} - ${fmt(p.timeline_end)}`,
                avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
                initials: (p.name || "P").slice(0, 2).toUpperCase(),
                groupId: group?.id,
                strongMatch: shared >= STRONG_MATCH_THRESHOLD,
                coverImageUrl: p.cover_image_url,
                interests: p.interests || [],
                timelineStart: p.timeline_start,
                timelineEnd: p.timeline_end,
                minSize: p.min_size,
                maxSize: p.max_size,
              };
            })}
          />
        )}
      </div>
    </AppShell>
  );
}
