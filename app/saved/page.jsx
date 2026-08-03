import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import { createClient } from "@/lib/supabase/server";

async function getSaved() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: favs } = await supabase.from("project_favorites").select("project_id").eq("user_id", user.id);
    const ids = (favs || []).map((f) => f.project_id);
    if (!ids.length) return [];
    const { data: projects } = await supabase.from("projects").select("id, name, description, skills_needed, type").in("id", ids);
    return projects || [];
  } catch {
    return [];
  }
}

export default async function SavedPage() {
  const projects = await getSaved();

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/home" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Saved</h1>
        </div>

        {projects.length === 0 ? (
          <div className="mt-24 px-8 text-center">
            <p className="text-[16px] font-semibold text-navy">Nothing saved yet</p>
            <p className="mt-1 text-[14px] text-muted">Tap the heart on a project to save it here.</p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3 px-6">
            {projects.map((p) => (
              <Link key={p.id} href={`/project/${p.id}`} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-[16px] font-bold text-navy">{p.name}</p>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-[11px] font-bold text-purple-600">{p.type === "personal" ? "Personal" : "Academic"}</span>
                </div>
                <p className="mt-1 text-[13px] text-muted line-clamp-2">{p.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(p.skills_needed || []).slice(0, 3).map((s) => <span key={s} className="rounded-full bg-[#f5f0ff] px-3 py-1 text-[11px] font-semibold text-purple-600">{s}</span>)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
