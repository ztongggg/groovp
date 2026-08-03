import Link from "next/link";
import AppShell from "@/components/AppShell";
import RateForm from "@/components/RateForm";
import ModerationMenu from "@/components/ModerationMenu";
import MessageButton from "@/components/MessageButton";
import { createClient } from "@/lib/supabase/server";

async function getData(id) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: p } = await supabase.from("profiles").select("*").eq("id", id).single();
    const { data: ratings } = await supabase
      .from("ratings")
      .select("id, stars, comment, created_at, rater:profiles!ratings_rater_id_fkey(full_name, username)")
      .eq("ratee_id", id)
      .order("created_at", { ascending: false });

    let blocked = false;
    if (user) {
      try {
        const { data: b } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", user.id).eq("blocked_id", id).maybeSingle();
        blocked = !!b;
      } catch {}
    }
    return { me: user?.id || null, p, ratings: ratings || [], blocked };
  } catch {
    return { me: null, p: null, ratings: [], blocked: false };
  }
}

export default async function UserProfilePage({ params }) {
  const { me, p, ratings, blocked } = await getData(params.id);

  if (!p) {
    return (
      <AppShell>
        <div className="min-h-full bg-white pt-24 text-center text-muted">User not found.</div>
      </AppShell>
    );
  }

  const name = p.full_name || p.username || "Student";
  const subtitle = [p.year, p.major, p.university || "SUTD"].filter(Boolean).join(" · ");
  const count = ratings.length;
  const avg = count ? (ratings.reduce((s, r) => s + r.stars, 0) / count).toFixed(1) : null;
  const personality = [p.personality, p.prefer_working, p.best_work_time, p.location].filter(Boolean);

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <div className="relative h-32" style={{ background: "linear-gradient(135deg,#2d1a6b,#5929bf)" }}>
          <Link href="/applicants" className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[18px] text-navy">‹</Link>
          {me && me !== p.id && (
            <div className="absolute right-5 top-5">
              <ModerationMenu userId={p.id} name={name} blocked={blocked} />
            </div>
          )}
        </div>
        {blocked && (
          <div className="mx-6 mt-4 rounded-xl bg-[#fae0e0] px-4 py-3 text-[13px] font-semibold text-[#bf4247]">
            You've blocked this user. Open the ⋯ menu to unblock.
          </div>
        )}

        <div className="px-6">
          <div className="-mt-12 flex items-end gap-4">
            <div className="relative h-24 w-24 shrink-0 rounded-full border-4 border-white" style={{ background: "#34b9a8" }}>
              <span className="absolute rounded-full bg-white" style={{ left: "34%", top: "44%", width: 9, height: 9 }} />
              <span className="absolute rounded-full bg-white" style={{ right: "34%", top: "44%", width: 9, height: 9 }} />
              <span className="absolute rounded-full bg-white" style={{ bottom: "30%", left: "50%", transform: "translateX(-50%)", width: 24, height: 7 }} />
            </div>
            <div className="pb-2">
              <h1 className="text-[24px] font-extrabold text-navy">{name}</h1>
              <p className="text-[14px] text-muted">@{p.username || "user"}</p>
            </div>
          </div>

          <p className="mt-3 text-[15px] text-muted">{subtitle}</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-[16px] font-extrabold text-navy">★ {avg || "New"} <span className="text-[13px] font-normal text-muted">({count} Ratings)</span></p>
            {me && me !== p.id && !blocked && <MessageButton userId={p.id} />}
          </div>

          {personality.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {personality.map((t) => <span key={t} className="rounded-full bg-[#f0eef5] px-4 py-2 text-[13px] font-semibold text-navy">{t}</span>)}
            </div>
          )}

          {p.skills?.length > 0 && (
            <>
              <p className="mb-2 mt-6 text-[13px] font-bold uppercase tracking-wide text-muted">Skills</p>
              <div className="flex flex-wrap gap-2">
                {p.skills.map((s) => <span key={s} className="rounded-full bg-[#f5f0ff] px-4 py-1.5 text-[13px] font-semibold text-purple-600">{s}</span>)}
              </div>
            </>
          )}

          {me && me !== p.id && (
            <div className="mt-6">
              <RateForm rateeId={p.id} name={name} />
            </div>
          )}

          <p className="mb-2 mt-6 text-[13px] font-bold uppercase tracking-wide text-muted">Ratings</p>
          {count === 0 ? (
            <p className="text-[14px] text-muted">No ratings yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
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
          )}
        </div>
      </div>
    </AppShell>
  );
}
