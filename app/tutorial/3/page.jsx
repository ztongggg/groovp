import Link from "next/link";
import ProjectDetailView from "@/components/ProjectDetailView";
import TutorialOverlay from "@/components/TutorialOverlay";
import { createClient } from "@/lib/supabase/server";

function fmt(d) {
  if (!d) return "";
  const [y, m, day] = d.split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

// Read-only — deliberately does NOT log a project_view or otherwise mutate
// anything (this is an illustrative tour, not a real visit).
async function getSampleProject() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("projects")
      .select("id,name,description,type,owner_id,join_code,allow_multiple_groups,number_of_groups,skills_needed,timeline_start,timeline_end,max_size,cover_image_url, owner:profiles!projects_owner_id_fkey(username), groups(id,name,leader_id,recruiting,members_wanted, group_members(user_id, profiles(full_name,username)))")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ? { ...data, meId: user?.id || null } : null;
  } catch {
    return null;
  }
}

export default async function Tutorial3Page() {
  const p = await getSampleProject();

  if (!p) {
    // No projects exist yet to illustrate with — skip straight to Tutorial 4
    // rather than showing a broken/empty spotlight.
    return (
      <div className="flex min-h-full items-center justify-center px-8 text-center text-muted">
        Nothing to preview yet.
        <Link href="/tutorial/4" className="ml-1 font-bold text-purple-600">Continue ›</Link>
      </div>
    );
  }

  const groups = (p.groups || []).map((g) => ({
    id: g.id,
    name: g.name,
    leaderId: g.leader_id,
    recruiting: g.recruiting !== false,
    membersWanted: g.members_wanted || 0,
    members: (g.group_members || []).map((m) => ({ user_id: m.user_id, name: m.profiles?.full_name || m.profiles?.username || "?" })),
  }));
  const total = groups.reduce((n, g) => n + g.members.length, 0);

  return (
    <div className="relative">
      <ProjectDetailView
        name={p.name}
        description={p.description || ""}
        type={p.type}
        ownerUsername={p.owner?.username || "owner"}
        dateRange={`${fmt(p.timeline_start)} - ${fmt(p.timeline_end)}`}
        skills={p.skills_needed || []}
        memberCount={`${total}/${p.max_size || 0}`}
        maxSize={p.max_size}
        groups={groups}
        meId={p.meId}
        projectId={p.id}
        favorited={false}
        joinCode={p.join_code}
        enrolled={false}
        isOwner={false}
        allowMultipleGroups={p.allow_multiple_groups !== false}
        coverImageUrl={p.cover_image_url}
        numberOfGroups={p.number_of_groups}
      />
      <TutorialOverlay
        step={3}
        spotlight={{ top: 804, left: 24, width: 354, height: 56, borderRadius: 20 }}
        title="Found one you like?"
        body="Tap here to request to join, with an optional note."
        showSkip
        backHref="/tutorial/2"
        nextHref="/tutorial/4"
      />
    </div>
  );
}
