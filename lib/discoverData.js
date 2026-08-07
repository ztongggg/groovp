import { STRONG_MATCH_THRESHOLD } from "@/lib/matching";

function fmt(d) {
  if (!d) return "";
  const [y, m, day] = d.split("T")[0].split("-");
  return `${day}/${m}/${y}`;
}

// Shared "GET /projects/feed"-equivalent — used by /discover and the tutorial
// screens that spotlight it (Tutorial 2 and 5), so they show genuinely real
// data via the same query rather than a forked copy.
//
// Ordered by match strength: the number of the viewer's own skills/interests the
// project asks for, highest first. Signed-out viewers have no overlap to score,
// so the created_at ordering from the query stands.
export async function getDiscoverItems(supabase, userId) {
  let mine = new Set();
  if (userId) {
    const { data: p } = await supabase.from("profiles").select("skills, interests").eq("id", userId).single();
    mine = new Set([...(p?.skills || []), ...(p?.interests || [])].map((s) => s.toLowerCase()));
  }

  const { data } = await supabase
    .from("projects")
    .select("id,name,description,skills_needed,interests,timeline_start,timeline_end,min_size,max_size,cover_image_url,status, groups(id, group_members(count))")
    .order("created_at", { ascending: false });

  const items = (data || [])
    .filter((p) => p.status !== "Deleted")
    .map((p) => {
      const group = p.groups?.[0];
      const members = group?.group_members?.[0]?.count ?? 0;
      const tags = [...(p.skills_needed || []), ...(p.interests || [])];
      const matchedTags = tags.filter((t) => mine.has((t || "").toLowerCase()));
      return {
        id: p.id,
        title: p.name,
        desc: p.description || "",
        skills: p.skills_needed || [],
        tags,
        matchedTags,
        memberCount: members,
        count: `${members}/${p.max_size || 0}`,
        date: `${fmt(p.timeline_start)} - ${fmt(p.timeline_end)}`,
        groupId: group?.id,
        matchCount: matchedTags.length,
        strongMatch: matchedTags.length >= STRONG_MATCH_THRESHOLD,
        coverImageUrl: p.cover_image_url,
        interests: p.interests || [],
        timelineStart: p.timeline_start,
        timelineEnd: p.timeline_end,
        minSize: p.min_size,
        maxSize: p.max_size,
      };
    });

  return items.sort((a, b) => b.matchCount - a.matchCount);
}
