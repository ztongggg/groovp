import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import ReportActions from "@/components/ReportActions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function relTime(iso) {
  if (!iso) return "";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const REASON_BG = {
  "Fake profile": "#fce5b8",
  Inappropriate: "#fddada",
  Spam: "#dcebff",
  Harassment: "#fddada",
  Other: "#ece8fc",
};

async function getData() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { admin: false, reports: [], byId: {} };

    const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    if (!me?.is_admin) return { admin: false, reports: [], byId: {} };

    const { data: reports } = await supabase
      .from("reports")
      .select("id, reporter_id, reported_user_id, reason, details, status, created_at")
      .order("created_at", { ascending: false });

    const rows = reports || [];
    const ids = [...new Set(rows.flatMap((r) => [r.reporter_id, r.reported_user_id]).filter(Boolean))];
    let byId = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, username").in("id", ids);
      byId = Object.fromEntries((profs || []).map((p) => [p.id, p]));
    }
    return { admin: true, reports: rows, byId };
  } catch {
    return { admin: false, reports: [], byId: {} };
  }
}

function who(byId, id) {
  const p = byId[id];
  if (!p) return { name: "Unknown user", handle: "" };
  return { name: p.full_name || p.username || "Unknown", handle: p.username ? `@${p.username}` : "" };
}

export default async function ModerationPage() {
  const { admin, reports, byId } = await getData();

  const openCount = reports.filter((r) => (r.status || "open") === "open").length;
  // Open reports first, then everything else, each newest-first (already sorted).
  const ordered = [...reports].sort((a, b) => {
    const ao = (a.status || "open") === "open" ? 0 : 1;
    const bo = (b.status || "open") === "open" ? 0 : 1;
    return ao - bo;
  });

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/settings" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Moderation</h1>
        </div>

        {!admin ? (
          <div className="mt-24 px-8 text-center">
            <p className="text-[16px] font-semibold text-navy">Admins only</p>
            <p className="mt-1 text-[14px] text-muted">You don't have access to the moderation queue.</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-24 px-8 text-center">
            <p className="text-[16px] font-semibold text-navy">Nothing to review</p>
            <p className="mt-1 text-[14px] text-muted">Reports submitted by users show up here.</p>
          </div>
        ) : (
          <>
            <p className="mt-2 px-6 text-[13px] text-muted">
              {openCount} open · {reports.length} total
            </p>
            <div className="mt-4 flex flex-col gap-3 px-5">
              {ordered.map((r) => {
                const st = r.status || "open";
                const reporter = who(byId, r.reporter_id);
                const reported = who(byId, r.reported_user_id);
                return (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-line p-4"
                    style={{ background: st === "open" ? "#faf9ff" : "#fff" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-bold text-navy"
                        style={{ background: REASON_BG[r.reason] || "#ece8fc" }}
                      >
                        {r.reason}
                      </span>
                      <span className="text-[12px] text-muted">{relTime(r.created_at)}</span>
                    </div>

                    <p className="mt-3 text-[14px] text-navy">
                      <Link href={`/u/${r.reported_user_id}`} className="font-bold underline">
                        {reported.name}
                      </Link>{" "}
                      {reported.handle && <span className="text-muted">{reported.handle}</span>}
                    </p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      Reported by {reporter.name} {reporter.handle}
                    </p>

                    {r.details && (
                      <p className="mt-2 rounded-xl bg-white p-3 text-[13px] text-navy" style={{ border: "1px solid #eee" }}>
                        {r.details}
                      </p>
                    )}

                    <ReportActions reportId={r.id} status={st} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
