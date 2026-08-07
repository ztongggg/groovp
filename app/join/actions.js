"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Normalise user input into the canonical GRV-XXXXX shape.
function normalise(raw) {
  let c = (raw || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!c) return "";
  if (!c.startsWith("GRV-")) c = c.startsWith("GRV") ? "GRV-" + c.slice(3) : "GRV-" + c;
  return c;
}

// Enrol the current user into a project via its share code. Idempotent.
export async function joinByCode(rawCode) {
  const code = normalise(rawCode);
  if (!code) return { error: "Enter a code." };

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  // Resolves via a SECURITY DEFINER RPC, not a direct select — an invite-only
  // project can't be read by a non-member otherwise, and the whole point of
  // a share code is that having it IS the access grant (schema_v13.sql).
  const { data: rows } = await supabase.rpc("resolve_join_code", { p_code: code });
  const project = rows?.[0];
  if (!project) return { error: "No project with that code." };

  const { error } = await supabase
    .from("project_members")
    .insert({ project_id: project.id, user_id: user.id });
  const already = error?.code === "23505";
  if (error && !already) return { error: error.message };

  revalidatePath(`/project/${project.id}`);
  return { ok: true, projectId: project.id, name: project.name, already };
}

// Enrol from the project page itself (button), for someone who arrived without a code.
export async function enrolInProject(projectId) {
  if (!projectId) return { error: "Missing project." };
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("project_members")
    .insert({ project_id: projectId, user_id: user.id });
  if (error && error.code !== "23505") return { error: error.message };

  revalidatePath(`/project/${projectId}`);
  return { ok: true };
}
