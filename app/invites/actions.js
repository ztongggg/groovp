"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Invitee responds to a leader's invite (status 'invited').
export async function respondToInvite(requestId, accept) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: req } = await supabase
    .from("join_requests")
    .select("id, group_id, user_id, status")
    .eq("id", requestId)
    .maybeSingle();
  if (!req || req.user_id !== user.id) return { error: "Invite not found." };
  if (req.status !== "invited") return { error: "This invite is no longer active." };

  if (!accept) {
    const { error } = await supabase.from("join_requests").update({ status: "declined" }).eq("id", requestId);
    if (error) return { error: error.message };
    revalidatePath("/invites");
    return { ok: true, declined: true };
  }

  // Accept: mark accepted, add self as member, notify the leader.
  const { error: upErr } = await supabase.from("join_requests").update({ status: "accepted" }).eq("id", requestId);
  if (upErr) return { error: upErr.message };

  const { error: memErr } = await supabase
    .from("group_members")
    .insert({ group_id: req.group_id, user_id: user.id, role: "member" });
  if (memErr && memErr.code !== "23505") return { error: memErr.message };

  try {
    const { data: g } = await supabase.from("groups").select("leader_id, project_id, name").eq("id", req.group_id).single();
    const { data: me } = await supabase.from("profiles").select("full_name, username").eq("id", user.id).single();
    if (g?.leader_id && g.leader_id !== user.id) {
      const { data: proj } = g.project_id ? await supabase.from("projects").select("name").eq("id", g.project_id).single() : { data: null };
      const who = me?.full_name || me?.username || "Someone";
      await supabase.from("notifications").insert({
        user_id: g.leader_id,
        type: "join_accepted",
        related_id: req.group_id,
        body: `${who} accepted your invite to ${proj?.name || g.name}`,
      });
    }
  } catch {}

  revalidatePath("/invites");
  revalidatePath("/teams");
  return { ok: true };
}
