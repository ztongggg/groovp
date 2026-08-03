import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import JoinGroupButton from "@/components/JoinGroupButton";
import { createClient } from "@/lib/supabase/server";

function fmt(d) {
  if (!d) return "";
  const [y, m, day] = d.split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

async function getProject(id) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id,name,description,type,skills_needed,timeline_start,timeline_end,max_size, owner:profiles!projects_owner_id_fkey(full_name,username), groups(id,name, group_members(user_id, profiles(full_name,username)))"
      )
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

const AVATAR = ["#e8863b", "#34b9a8", "#f2a5bd", "#7c3aed", "#4ac7b2"];

export default async function ProjectDetailPage({ params }) {
  const p = await getProject(params.id);

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/discover" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1e1b4b" }}>Project</h1>
        </div>

        {!p ? (
          <div className="mt-24 px-8 text-center text-muted">Project not found.</div>
        ) : (
          <div className="px-6">
            {/* hero */}
            <div className="mt-4 flex h-32 items-end rounded-3xl p-5" style={{ background: "linear-gradient(135deg,#2d1a6b,#5929bf)" }}>
              <div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-[12px] font-bold text-white">
                  {p.type === "personal" ? "Personal" : "🎓 Academic"}
                </span>
                <h2 className="mt-2 text-[24px] font-extrabold text-white">{p.name}</h2>
              </div>
            </div>

            <p className="mt-3 text-[13px] text-muted">
              by @{p.owner?.username || "owner"} · {fmt(p.timeline_start)} – {fmt(p.timeline_end)}
            </p>

            <p className="mt-4 text-[15px] leading-relaxed text-navy">{p.description}</p>

            {p.skills_needed?.length > 0 && (
              <>
                <p className="mb-2 mt-5 text-[13px] font-bold uppercase tracking-wide text-muted">Skills needed</p>
                <div className="flex flex-wrap gap-2">
                  {p.skills_needed.map((s, i) => (
                    <span key={s} className="rounded-full px-4 py-1.5 text-[13px] font-semibold" style={{ background: i === 0 ? "#7c3aed" : "#f5f0ff", color: i === 0 ? "#fff" : "#7c3aed" }}>{s}</span>
                  ))}
                </div>
              </>
            )}

            {/* groups */}
            <p className="mb-2 mt-6 text-[13px] font-bold uppercase tracking-wide text-muted">
              Groups open · {p.groups?.length || 0}
            </p>
            <div className="flex flex-col gap-3">
              {(p.groups || []).map((g) => {
                const members = g.group_members || [];
                const full = members.length >= (p.max_size || 99);
                return (
                  <div key={g.id} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                    <div className="flex items-center justify-between">
                      <p className="text-[16px] font-bold text-navy">{g.name}</p>
                      <span className="text-[13px] font-semibold text-muted">{members.length}/{p.max_size} members</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {members.slice(0, 5).map((m, i) => (
                          <span key={m.user_id} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white" style={{ background: AVATAR[i % AVATAR.length] }}>
                            {(m.profiles?.full_name || m.profiles?.username || "?").slice(0, 2).toUpperCase()}
                          </span>
                        ))}
                      </div>
                      <JoinGroupButton groupId={g.id} full={full} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
