import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import { createClient } from "@/lib/supabase/server";

async function getData(id) {
  try {
    const supabase = createClient();
    const { data: pp } = await supabase.from("past_projects").select("id, user_id, project_id, role, write_up, photos, created_at").eq("id", id).single();
    if (!pp) return null;

    const { data: owner } = await supabase.from("profiles").select("full_name, username").eq("id", pp.user_id).single();
    const { data: project } = pp.project_id ? await supabase.from("projects").select("id, name").eq("id", pp.project_id).single() : { data: null };

    return { ...pp, ownerName: owner?.full_name || owner?.username || "Someone", project };
  } catch {
    return null;
  }
}

// Past Project Detail (Figma node 682:10946) — read-only view of a single
// past_projects entry, reached from My Profile's Project tab (which previously
// rendered entries as plain non-clickable divs).
export default async function PastProjectDetailPage({ params }) {
  const pp = await getData(params.id);

  if (!pp) {
    return (
      <AppShell>
        <div className="min-h-full bg-white pt-24 text-center text-muted">Not found.</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/profile" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Past Project</h1>
        </div>

        <div className="mt-5 px-6">
          <p className="text-[20px] font-extrabold text-navy">{pp.role}</p>
          <p className="mt-1 text-[13px] text-muted">{pp.ownerName}</p>

          {pp.project && (
            <Link href={`/project/${pp.project.id}`} className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-purple-600" style={{ background: "#f5f0ff" }}>
              Part of {pp.project.name} ›
            </Link>
          )}

          {pp.write_up && (
            <div className="mt-5 rounded-2xl bg-[#f9f7ff] p-4">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted">About</p>
              <p className="text-[14px] leading-relaxed text-navy">{pp.write_up}</p>
            </div>
          )}

          {pp.photos?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {pp.photos.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="h-24 w-24 rounded-2xl object-cover" />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
