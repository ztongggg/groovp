import TeamsView from "@/components/TeamsView";
import TutorialOverlay from "@/components/TutorialOverlay";
import { createClient } from "@/lib/supabase/server";

function relTime(iso) {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Applied today";
  if (days === 1) return "Applied 1 day ago";
  if (days < 7) return `Applied ${days} days ago`;
  const w = Math.floor(days / 7);
  return w === 1 ? "Applied 1 week ago" : `Applied ${w} weeks ago`;
}

async function getData() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: reqs } = await supabase
      .from("join_requests")
      .select("id,status,created_at, groups(name, photo_url, projects(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    return (reqs || []).filter((r) => r.status !== "invited").map((r) => ({
      id: r.id, status: r.status, title: r.groups?.projects?.name || "Project", subtitle: r.groups?.name || "Group", applied: relTime(r.created_at), photoUrl: r.groups?.photo_url || null,
    }));
  } catch {
    return [];
  }
}

// A brand-new user (the only audience for this tour) genuinely has zero
// requests yet — real data means this legitimately shows Teams - Requested's
// empty state rather than spec's illustrative "2 status cards." Spotlighting
// the list area either way, honest to real data over fabricating sample rows.
export default async function Tutorial4Page() {
  const requests = await getData();
  return (
    <div className="relative">
      <TeamsView requests={requests} teams={[]} />
      <TutorialOverlay
        step={4}
        spotlight={{ top: 150, left: 24, width: 354, height: requests.length ? Math.min(216, requests.length * 108) : 92, borderRadius: 18 }}
        title="Keep track here"
        body="See if your requests are Pending, Accepted, or Declined."
        backHref="/tutorial/3"
        nextHref="/tutorial/5"
      />
    </div>
  );
}
