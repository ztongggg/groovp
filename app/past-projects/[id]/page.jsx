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
    const { data: project } = pp.project_id ? await supabase.from("projects").select("id, name, timeline_start, timeline_end").eq("id", pp.project_id).single() : { data: null };

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

  const ongoing = pp.project?.timeline_end ? new Date(pp.project.timeline_end) > new Date() : !pp.project?.timeline_end;
  const dateRange = pp.project?.timeline_start
    ? `${new Date(pp.project.timeline_start).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} — ${pp.project.timeline_end ? new Date(pp.project.timeline_end).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Present"}`
    : null;

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <div className="relative flex flex-col justify-between px-6 pb-4 pt-14" style={{ height: 180, background: "linear-gradient(135deg,#4ac7b2,#2d6b5f)" }}>
          <Link href="/profile" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "rgba(255,255,255,0.9)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-navy" style={{ background: "rgba(255,255,255,0.9)" }}>
            {ongoing ? "In progress" : "✓ Completed"}
          </span>
        </div>

        <div className="mt-5 px-6">
          <p className="text-[20px] font-extrabold text-navy">{pp.project?.name || "Untitled project"}</p>
          {pp.role && <p className="mt-0.5 text-[14px] font-semibold text-purple-600">{pp.role}</p>}

          {dateRange && (
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Timeline</p>
              <p className="mt-1 text-[14px] font-semibold text-navy">{dateRange}</p>
            </div>
          )}

          {pp.write_up && (
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted">Write-up</p>
              <p className="mt-1 text-[14px] leading-relaxed text-navy">{pp.write_up}</p>
            </div>
          )}

          {pp.photos?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">Photos</p>
              <div className="flex flex-wrap gap-2">
                {pp.photos.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" className="h-24 w-24 rounded-2xl object-cover" />
                ))}
              </div>
            </div>
          )}

          {pp.project && (
            <Link href={`/project/${pp.project.id}`} className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-purple-600" style={{ background: "#f5f0ff" }}>
              View full project ›
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
