// Shared group-capacity check (plain helper, not a server action).
// Returns { full, member, count, cap }:
//   full   = true if adding a new member would exceed the group's max
//   member = true if userId is already in the group
export async function groupHasRoom(supabase, groupId, userId) {
  const { data: g } = await supabase.from("groups").select("max_members, project_id").eq("id", groupId).single();
  let cap = g?.max_members || 0;
  if (!cap && g?.project_id) {
    const { data: proj } = await supabase.from("projects").select("max_size").eq("id", g.project_id).single();
    cap = proj?.max_size || 0;
  }
  if (!cap) cap = 5; // sane default
  const { count } = await supabase.from("group_members").select("user_id", { count: "exact", head: true }).eq("group_id", groupId);
  const { data: mine } = await supabase.from("group_members").select("user_id").eq("group_id", groupId).eq("user_id", userId).maybeSingle();
  return { full: !mine && (count || 0) >= cap, member: !!mine, count: count || 0, cap };
}
