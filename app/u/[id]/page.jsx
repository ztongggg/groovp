import Link from "next/link";
import AppShell from "@/components/AppShell";
import RateForm from "@/components/RateForm";
import ModerationMenu from "@/components/ModerationMenu";
import MessageButton from "@/components/MessageButton";
import { createClient } from "@/lib/supabase/server";
import { computeMatch } from "@/lib/matching";

async function getData(id, groupId) {
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

    // Reviewing an applicant against a specific group (from Requests) — compute the
    // Strong Match / highlighted-attributes state (spec §5), only when groupId is passed.
    let match = null;
    if (groupId) {
      try {
        const { data: g } = await supabase.from("groups").select("skills_wanted, interests_wanted, personality_wanted").eq("id", groupId).single();
        if (g) match = computeMatch(p || {}, g);
      } catch {}
    }

    // Rate Teammates is only legal against a project you and they shared a now-
    // ended group on (spec's business rule) — resolve the first eligible one so
    // the generic profile Rate form has a real project_id to submit against.
    // If there's more than one shared ended project, this picks one of them
    // (not necessarily "the most recent") rather than presenting a picker.
    let rateableProjectId = null;
    if (user && user.id !== id) {
      try {
        const { data: myEnded } = await supabase.from("group_members").select("group_id, groups!inner(project_id, status)").eq("user_id", user.id).eq("groups.status", "Ended");
        const myGroupIds = (myEnded || []).map((g) => g.group_id);
        if (myGroupIds.length) {
          const { data: shared } = await supabase.from("group_members").select("group_id").eq("user_id", id).in("group_id", myGroupIds);
          const sharedIds = new Set((shared || []).map((s) => s.group_id));
          const found = (myEnded || []).find((g) => sharedIds.has(g.group_id));
          rateableProjectId = found?.groups?.project_id || null;
        }
      } catch {}
    }

    return { me: user?.id || null, p, ratings: ratings || [], blocked, match, rateableProjectId };
  } catch {
    return { me: null, p: null, ratings: [], blocked: false, match: null, rateableProjectId: null };
  }
}

export default async function UserProfilePage({ params, searchParams }) {
  const { me, p, ratings, blocked, match, rateableProjectId } = await getData(params.id, searchParams?.groupId);
  const groupId = searchParams?.groupId;
  const queue = searchParams?.queue ? searchParams.queue.split(",").filter(Boolean) : [];
  const queueIndex = queue.indexOf(params.id);
  const showPaging = queue.length > 1 && queueIndex !== -1;
  const pagingHref = (i) => `/u/${queue[i]}?groupId=${groupId}&queue=${queue.join(",")}`;

  if (!p) {
    return (
      <AppShell>
        <div className="min-h-full bg-white pt-24 text-center text-muted">User not found.</div>
      </AppShell>
    );
  }

  const name = p.full_name || p.username || "Student";
  const subtitle = [p.year, p.major, p.university || "SUTD"].filter(Boolean).join(" · ");
  const ratingsVisible = me === p.id || p.show_ratings_publicly !== false;
  const count = ratingsVisible ? ratings.length : 0;
  const avg = count ? (ratings.reduce((s, r) => s + r.stars, 0) / count).toFixed(1) : null;
  const personality = [p.personality, p.prefer_working, p.best_work_time, p.location].filter(Boolean);

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <div className="relative h-32" style={{ background: "linear-gradient(135deg,#2d1a6b,#5929bf)" }}>
          <Link href="/applicants" className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[18px] text-navy">‹</Link>
          {showPaging && (
            <div className="absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/85 px-3 py-1.5">
              <Link href={pagingHref(Math.max(0, queueIndex - 1))} aria-label="Previous applicant" className="text-[16px] font-bold text-navy" style={{ opacity: queueIndex === 0 ? 0.35 : 1, pointerEvents: queueIndex === 0 ? "none" : "auto" }}>‹</Link>
              <span className="text-[12px] font-bold text-navy">{queueIndex + 1} of {queue.length}</span>
              <Link href={pagingHref(Math.min(queue.length - 1, queueIndex + 1))} aria-label="Next applicant" className="text-[16px] font-bold text-navy" style={{ opacity: queueIndex === queue.length - 1 ? 0.35 : 1, pointerEvents: queueIndex === queue.length - 1 ? "none" : "auto" }}>›</Link>
            </div>
          )}
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
              <h1 className="flex items-center gap-1.5 text-[24px] font-extrabold text-navy">
                {name}
                {match?.isStrongMatch && (
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white" style={{ background: "#7c3aed" }}>✨ Strong Match</span>
                )}
                {p.linkedin_verified && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a66c2" aria-label="LinkedIn verified"><title>LinkedIn verified</title><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" /></svg>
                )}
                {p.github_verified && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1f2328" aria-label="GitHub verified"><title>GitHub verified</title><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.4-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.28 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" /></svg>
                )}
              </h1>
              <p className="text-[14px] text-muted">@{p.username || "user"}</p>
            </div>
          </div>

          <p className="mt-3 text-[15px] text-muted">{subtitle}</p>
          <div className="mt-1 flex items-center justify-between">
            {ratingsVisible ? (
              <p className="text-[16px] font-extrabold text-navy">★ {avg || "New"} <span className="text-[13px] font-normal text-muted">({count} Ratings)</span></p>
            ) : (
              <p className="text-[13px] font-semibold text-muted">Ratings are private</p>
            )}
            {me && me !== p.id && !blocked && <MessageButton userId={p.id} />}
          </div>

          {personality.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {personality.map((t) => {
                const matched = match?.matchedPersonality?.some((m) => m.toLowerCase() === t.toLowerCase());
                return (
                  <span key={t} className="rounded-full px-4 py-2 text-[13px] font-semibold" style={matched ? { background: "#d4f2de", color: "#298c52", border: "1px solid #298c52" } : { background: "#f0eef5", color: "#1e1b4b" }}>{t}</span>
                );
              })}
            </div>
          )}

          {p.skills?.length > 0 && (
            <>
              <p className="mb-2 mt-6 text-[13px] font-bold uppercase tracking-wide text-muted">Skills</p>
              <div className="flex flex-wrap gap-2">
                {p.skills.map((s) => {
                  const matched = match?.matchedSkills?.some((m) => m.toLowerCase() === s.toLowerCase());
                  return (
                    <span key={s} className="rounded-full px-4 py-1.5 text-[13px] font-semibold" style={matched ? { background: "#d4f2de", color: "#298c52", border: "1px solid #298c52" } : { background: "#f5f0ff", color: "#7c3aed" }}>{s}</span>
                  );
                })}
              </div>
            </>
          )}

          {p.interests?.length > 0 && (
            <>
              <p className="mb-2 mt-6 text-[13px] font-bold uppercase tracking-wide text-muted">Interests</p>
              <div className="flex flex-wrap gap-2">
                {p.interests.map((s) => {
                  const matched = match?.matchedInterests?.some((m) => m.toLowerCase() === s.toLowerCase());
                  return (
                    <span key={s} className="rounded-full px-4 py-1.5 text-[13px] font-semibold" style={matched ? { background: "#d4f2de", color: "#298c52", border: "1px solid #298c52" } : { background: "#f5f0ff", color: "#7c3aed" }}>{s}</span>
                  );
                })}
              </div>
            </>
          )}

          {me && me !== p.id && rateableProjectId && (
            <div className="mt-6">
              <RateForm rateeId={p.id} name={name} projectId={rateableProjectId} />
            </div>
          )}

          <p className="mb-2 mt-6 text-[13px] font-bold uppercase tracking-wide text-muted">Ratings</p>
          {!ratingsVisible ? (
            <p className="text-[14px] text-muted">{name} has chosen to keep ratings private.</p>
          ) : count === 0 ? (
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
