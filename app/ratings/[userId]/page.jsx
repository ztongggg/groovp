import Link from "next/link";
import AppShell from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";

async function getData(userId) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: p } = await supabase.from("profiles").select("full_name, username, show_ratings_publicly").eq("id", userId).single();
    const visible = user?.id === userId || p?.show_ratings_publicly !== false;
    const { data: ratings } = visible
      ? await supabase
          .from("ratings")
          .select("id, stars, comment, created_at, project_id, rater:profiles!ratings_rater_id_fkey(id, full_name, username, avatar_url)")
          .eq("ratee_id", userId)
          .order("created_at", { ascending: false })
      : { data: [] };

    // Each review names the project it came from. Separate query rather than a
    // nested embed — embeds have returned null on Vercel in this codebase before.
    let projById = {};
    const projIds = [...new Set((ratings || []).map((r) => r.project_id).filter(Boolean))];
    if (projIds.length) {
      const { data: projs } = await supabase.from("projects").select("id, name").in("id", projIds);
      projById = Object.fromEntries((projs || []).map((r) => [r.id, r.name]));
    }

    return { name: p?.full_name || p?.username || "Student", ratings: (ratings || []).map((r) => ({ ...r, projectName: projById[r.project_id] || null })), visible };
  } catch {
    return { name: "Student", ratings: [], visible: true };
  }
}

function relDays(iso) {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d < 1) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} week${w === 1 ? "" : "s"} ago`;
  const m = Math.floor(d / 30);
  return `${m} month${m === 1 ? "" : "s"} ago`;
}

function Stars({ value, size = 19 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= value ? "#FFD84D" : "none"} stroke={n <= value ? "#FFD84D" : "#F3F1F8"} strokeWidth="2" strokeLinejoin="round">
          <path d="m12 3.5 2.6 5.6 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6L3.4 9.8l6-.7L12 3.5Z" />
        </svg>
      ))}
    </span>
  );
}

const AVATARS = ["#A78BFA", "#4AC7B2", "#F472B6", "#FBBF24", "#9496F4"];

function RaterAvatar({ url, index }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" style={{ width: 44, height: 44, borderRadius: 9999, objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <span style={{ position: "relative", width: 44, height: 44, borderRadius: 9999, background: AVATARS[index % AVATARS.length], flexShrink: 0, display: "block" }}>
      <span style={{ position: "absolute", left: 8, top: 17, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: 30, top: 17, width: 6, height: 6, borderRadius: 9999, background: "#fff" }} />
      <span style={{ position: "absolute", left: 16, top: 26, width: 12, height: 3, borderRadius: 9999, background: "#fff" }} />
    </span>
  );
}

// Ratings History — summary card (average, star row, 5→1 distribution bars)
// plus the full reviews list.
export default async function RatingsHistoryPage({ params }) {
  const { name, ratings, visible } = await getData(params.userId);
  const count = ratings.length;
  const avg = count ? (ratings.reduce((s, r) => s + r.stars, 0) / count).toFixed(1) : null;
  const dist = [5, 4, 3, 2, 1].map((n) => ratings.filter((r) => r.stars === n).length);

  return (
    <AppShell>
      <div className="min-h-full pb-8" style={{ background: "#F9F8FB" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 24px" }}>
          <Link href={`/u/${params.userId}`} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }}>‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1D1B44" }}>Ratings</h1>
        </div>

        {!visible ? (
          <p style={{ marginTop: 64, textAlign: "center", fontSize: 14, color: "#757080" }}>{name} has chosen to keep ratings private.</p>
        ) : count === 0 ? (
          <div style={{ marginTop: 100, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 32px", textAlign: "center" }}>
            <div style={{ position: "relative", width: 281, height: 281 }}>
              <div style={{ position: "absolute", background: "#2ED573", left: 43.1, top: 157.5, width: 93.8, height: 73.1, borderTopLeftRadius: 60 }} />
              <div style={{ position: "absolute", background: "#2ED573", left: 125.6, top: 48.8, width: 112.5, height: 181.9, borderTopRightRadius: 60 }} />
              <div style={{ position: "absolute", background: "#0B2A5B", left: 65.6, top: 195, width: 16.9, height: 16.9, borderRadius: 9999 }} />
              <div style={{ position: "absolute", background: "#0B2A5B", left: 103.1, top: 195, width: 16.9, height: 16.9, borderRadius: 9999 }} />
              <div style={{ position: "absolute", background: "#115E59", left: 50.6, top: 219.4, width: 31.9, height: 7.5, borderRadius: 9999 }} />
            </div>
            <p style={{ marginTop: 24, fontSize: 19, fontWeight: 800, color: "#1D1B44" }}>No ratings yet</p>
            <p style={{ marginTop: 10, fontSize: 12.5, color: "#757080", lineHeight: "18px" }}>Complete your first project to start<br />building your reputation.</p>
          </div>
        ) : (
          <div style={{ marginTop: 22, padding: "0 23px", display: "flex", flexDirection: "column", gap: 21 }}>
            {/* Summary */}
            <div style={{ background: "#fff", borderRadius: 16, height: 110, display: "flex", alignItems: "center" }}>
              <div style={{ width: 120, textAlign: "center" }}>
                <p style={{ fontSize: 44, fontWeight: 800, color: "#1D1B44", lineHeight: "50px" }}>{avg}</p>
                <div style={{ display: "flex", justifyContent: "center", marginTop: 2 }}><Stars value={Math.round(avg)} size={14.5} /></div>
                <p style={{ fontSize: 11, color: "#757080", marginTop: 4 }}>{count} rating{count === 1 ? "" : "s"}</p>
              </div>
              <div style={{ flex: 1, paddingRight: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {dist.map((n, i) => (
                  <div key={i} style={{ height: 6, borderRadius: 3, background: "#F3F1F8", overflow: "hidden" }}>
                    <div style={{ height: 6, borderRadius: 3, background: "#F2B226", width: `${Math.max(n ? 3 : 0, (n / count) * 100)}%` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {ratings.map((r, i) => (
              <div key={r.id} style={{ background: "#fff", borderRadius: 18, border: "1px solid #F3F1F8", boxShadow: "0px 2px 10px rgba(25,20,51,0.05)", padding: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <RaterAvatar url={r.rater?.avatar_url} index={i} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1D1B44" }}>{r.rater?.full_name || r.rater?.username || "Someone"}</p>
                    <p style={{ fontSize: 11, color: "#757080", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.projectName || "Groovp project"}</p>
                  </div>
                  <Stars value={r.stars} />
                </div>
                {r.comment && <p style={{ marginTop: 16, fontSize: 11.5, color: "#1D1B44", lineHeight: "17px" }}>{r.comment}</p>}
                <p style={{ marginTop: 12, fontSize: 10, color: "#757080" }}>{relDays(r.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
