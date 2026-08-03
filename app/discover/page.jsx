import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import DiscoverCard from "@/components/DiscoverCard";
import { createClient } from "@/lib/supabase/server";

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
      .select("id,name,description,skills_needed,interests,timeline_start,timeline_end,min_size,max_size, groups(id, group_members(count))")
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
          <Link href="/create" aria-label="Create project" className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#7c3aed" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </Link>
        </div>

        {/* Search + filter */}
        <div className="mt-4 flex items-center gap-3 px-[30px]">
          <div className="flex flex-1 items-center" style={{ height: 42, borderRadius: 14, background: "#f5f0ff", border: "1px solid #ede9fe", paddingLeft: 15 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
            <input placeholder="Search projects…" className="ml-2.5 w-full bg-transparent focus:outline-none" style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }} />
          </div>
          <button className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 14, background: "#7c3aed" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M4 8h16M4 16h16" /><circle cx="15" cy="8" r="2.4" fill="#7c3aed" /><circle cx="9" cy="16" r="2.4" fill="#7c3aed" /></svg>
          </button>
        </div>

        {/* Projects */}
        {projects.length === 0 ? (
          <div className="mt-24 flex flex-col items-center px-8 text-center">
            <p className="text-[16px] font-semibold text-navy">No projects yet</p>
            <p className="mt-1 text-[14px] text-muted">Be the first to create one.</p>
            <Link href="/create" className="mt-5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 text-[15px] font-bold text-white">
              Create a project
            </Link>
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center gap-6">
            {projects.map((p, i) => {
              const group = p.groups?.[0];
              const members = group?.group_members?.[0]?.count ?? 0;
              const tags = [...(p.skills_needed || []), ...(p.interests || [])];
              const shared = tags.filter((t) => mine.has((t || "").toLowerCase())).length;
              return (
                <DiscoverCard
                  key={p.id}
                  title={p.name}
                  desc={p.description || ""}
                  skills={p.skills_needed || []}
                  count={`${members}/${p.max_size || 0}`}
                  date={`${fmt(p.timeline_start)} - ${fmt(p.timeline_end)}`}
                  avatarColor={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                  initials={(p.name || "P").slice(0, 2).toUpperCase()}
                  groupId={group?.id}
                  projectId={p.id}
                  strongMatch={shared >= 2}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
