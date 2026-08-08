import Link from "next/link";
import AppShell from "@/components/AppShell";
import BackButton from "@/components/BackButton";
import { createClient } from "@/lib/supabase/server";

async function getData(id) {
  try {
    const supabase = createClient();
    const { data: pp } = await supabase.from("past_projects").select("id, user_id, project_id, role, write_up, photos, created_at").eq("id", id).single();
    if (!pp) return null;

    const { data: owner } = await supabase.from("profiles").select("full_name, username").eq("id", pp.user_id).single();
    const { data: project } = pp.project_id ? await supabase.from("projects").select("id, name, timeline_start, timeline_end").eq("id", pp.project_id).single() : { data: null };

    // Teammates = the other people in whichever group(s) of this project the
    // entry's owner was actually in. Plain queries, no nested embeds.
    let teammates = [];
    if (pp.project_id) {
      try {
        const { data: groups } = await supabase.from("groups").select("id").eq("project_id", pp.project_id);
        const groupIds = (groups || []).map((g) => g.id);
        if (groupIds.length) {
          const { data: mine } = await supabase.from("group_members").select("group_id").eq("user_id", pp.user_id).in("group_id", groupIds);
          const sharedIds = (mine || []).map((m) => m.group_id);
          if (sharedIds.length) {
            const { data: others } = await supabase.from("group_members").select("user_id").in("group_id", sharedIds).neq("user_id", pp.user_id);
            const ids = [...new Set((others || []).map((o) => o.user_id))];
            if (ids.length) {
              const { data: profs } = await supabase.from("profiles").select("id, full_name, username, avatar_url").in("id", ids);
              teammates = profs || [];
            }
          }
        }
      } catch {}
    }

    return { ...pp, ownerName: owner?.full_name || owner?.username || "Someone", project, teammates };
  } catch {
    return null;
  }
}

const AVATARS = ["#A78BFA", "#F472B6", "#4AC7B2", "#FBBF24", "#9496F4"];
const PHOTO_TINTS = ["#4AC7B2", "#F29C38", "#F2A5BD"];

const H = { fontSize: 13, fontWeight: 700, color: "#1D1B44" };

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
  const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const dateRange = pp.project?.timeline_start
    ? `${fmt(pp.project.timeline_start)} — ${pp.project.timeline_end && !ongoing ? fmt(pp.project.timeline_end) : "Present"}`
    : null;

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-10">
        <div style={{ position: "relative", height: 200, background: "linear-gradient(76deg, #4AC7B2 0%, #256359 100%)" }}>
          <BackButton fallbackHref="/profile" style={{ position: "absolute", left: 24, top: 48, width: 40, height: 40, borderRadius: 9999, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }} />
          <span style={{ position: "absolute", left: 24, top: 150, background: "#F3F1F8", borderRadius: 13, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1D1B44" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7" /></svg>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "#1D1B44" }}>{ongoing ? "In progress" : "Completed"}</span>
          </span>
        </div>

        <div style={{ padding: "0 24px" }}>
          <p style={{ marginTop: 22, fontSize: 22, fontWeight: 800, color: "#1D1B44" }}>{pp.project?.name || pp.role || "Untitled project"}</p>
          {/* Only when the entry is linked to a real project — otherwise the
              role is already the title above. */}
          {pp.role && pp.project?.name && <p style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: "#6126CC" }}>{pp.role}</p>}

          {dateRange && (
            <div style={{ marginTop: 30 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#757080" }}>Timeline</p>
              <p style={{ marginTop: 6, fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>{dateRange}</p>
            </div>
          )}

          {pp.write_up && (
            <div style={{ marginTop: 30 }}>
              <p style={H}>Write-up</p>
              <p style={{ marginTop: 12, fontSize: 13, color: "#757080", lineHeight: "20px" }}>{pp.write_up}</p>
            </div>
          )}

          {pp.photos?.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <p style={H}>Photos</p>
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10 }}>
                {pp.photos.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" style={{ width: 112, height: 90, borderRadius: 14, objectFit: "cover", background: PHOTO_TINTS[i % PHOTO_TINTS.length] }} />
                ))}
              </div>
            </div>
          )}

          {pp.teammates.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <p style={H}>Teammates</p>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {pp.teammates.map((t, i) => (
                  <Link key={t.id} href={`/u/${t.id}`} style={{ height: 56, background: "#F3F1F8", borderRadius: 14, display: "flex", alignItems: "center", gap: 12, padding: "0 8px" }}>
                    {t.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: 9999, objectFit: "cover" }} />
                    ) : (
                      <span style={{ position: "relative", width: 44, height: 44, borderRadius: 9999, background: AVATARS[i % AVATARS.length], display: "block", flexShrink: 0 }}>
                        <span style={{ position: "absolute", left: 8, top: 17, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
                        <span style={{ position: "absolute", left: 30, top: 17, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
                        <span style={{ position: "absolute", left: 16, top: 26, width: 12, height: 3, borderRadius: 9999, background: "#fff" }} />
                      </span>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1D1B44" }}>{t.full_name || t.username || "Teammate"}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {pp.project && (
            <Link href={`/project/${pp.project.id}`} style={{ marginTop: 30, display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#7C3AED", background: "#F5F0FF" }}>
              View full project ›
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
