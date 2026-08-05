import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import { createClient } from "@/lib/supabase/server";

async function getData(userId) {
  try {
    const supabase = createClient();
    const { data: p } = await supabase.from("profiles").select("full_name, username").eq("id", userId).single();
    const { data: ratings } = await supabase
      .from("ratings")
      .select("id, stars, comment, created_at, rater:profiles!ratings_rater_id_fkey(full_name, username)")
      .eq("ratee_id", userId)
      .order("created_at", { ascending: false });
    return { name: p?.full_name || p?.username || "Student", ratings: ratings || [] };
  } catch {
    return { name: "Student", ratings: [] };
  }
}

// Ratings History (Figma node 682:10905) — full reviews list + star-distribution
// summary, reached from My Profile's rating line (previously showed inline only,
// no dedicated view).
export default async function RatingsHistoryPage({ params }) {
  const { name, ratings } = await getData(params.userId);
  const count = ratings.length;
  const avg = count ? (ratings.reduce((s, r) => s + r.stars, 0) / count).toFixed(1) : null;
  const dist = [5, 4, 3, 2, 1].map((n) => ratings.filter((r) => r.stars === n).length);
  const maxDist = Math.max(1, ...dist);

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href={`/u/${params.userId}`} className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Ratings History</h1>
        </div>
        <p className="mt-1 px-6 text-[13px] text-muted">{name}</p>

        {count === 0 ? (
          <p className="mt-16 text-center text-[14px] text-muted">No ratings yet.</p>
        ) : (
          <>
            <div className="mx-6 mt-5 rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center gap-3">
                <p className="text-[32px] font-extrabold text-navy">{avg}</p>
                <div>
                  <p style={{ color: "#f5b301", fontSize: 16 }}>{"★".repeat(Math.round(avg))}<span style={{ color: "#d6d3de" }}>{"★".repeat(5 - Math.round(avg))}</span></p>
                  <p className="text-[12px] text-muted">{count} rating{count === 1 ? "" : "s"}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((n, i) => (
                  <div key={n} className="flex items-center gap-2">
                    <span className="w-3 text-[11px] font-semibold text-muted">{n}</span>
                    <div className="h-2 flex-1 rounded-full bg-[#f0eef5]">
                      <div className="h-2 rounded-full" style={{ width: `${(dist[i] / maxDist) * 100}%`, background: "#f5b301" }} />
                    </div>
                    <span className="w-4 text-[11px] text-muted">{dist[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 px-6">
              {ratings.map((r) => (
                <div key={r.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-navy">{r.rater?.full_name || r.rater?.username || "Someone"}</p>
                    <p style={{ color: "#f5b301", fontSize: 14 }}>{"★".repeat(r.stars)}<span style={{ color: "#d6d3de" }}>{"★".repeat(5 - r.stars)}</span></p>
                  </div>
                  {r.comment && <p className="mt-1 text-[13px] text-muted">{r.comment}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
