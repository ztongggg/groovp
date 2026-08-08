"use server";

// ── Web Experiment (Personalised Work Style condition) ──────────────────
// Thin, removable instrumentation wrapped around the real app — no
// duplicate screens, no forked flows. To rip this out entirely: delete
// this file, components/ExperimentTimerOverlay.jsx, app/experiment/,
// supabase/schema_v14.sql, the <ExperimentTimerOverlay/> line in
// app/layout.jsx, the "Start Web Experiment" block in app/login/page.jsx,
// and the handful of one-line calls into this module in app/signup,
// app/tutorial/actions.js, app/discover/actions.js, app/create,
// app/applicants, app/groups/[groupId] — every one of them is tagged
// "EXPERIMENT:" so they're a grep away.
//
// Design: a cookie (not auth) is the participant's identity for the first
// leg of Task 1, since they don't have an account yet when it starts.
// Every marker below is a no-op when the cookie isn't set, so none of this
// touches real users at all.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const COOKIE = "grv_exp_sid";
const CONDITION = "personalised"; // the other arm ("neutral") is a future session, not built here

function getSid() {
  try {
    return cookies().get(COOKIE)?.value || null;
  } catch {
    return null;
  }
}

// Clicked from the Welcome page. Creates the session row, starts Task 1's
// clock immediately (landing on Signup IS the first page of Task 1), and
// hands off into the real signup flow — nothing about signup itself changes.
export async function startExperimentSession() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("experiment_sessions")
    .insert({ condition: CONDITION })
    .select("id")
    .single();
  if (error || !data) return;

  await supabase
    .from("experiment_task_events")
    .insert({ session_id: data.id, task_number: 1, started_at: new Date().toISOString() });

  cookies().set(COOKIE, data.id, { maxAge: 60 * 60 * 4, path: "/", httpOnly: true, sameSite: "lax" });
  redirect("/signup");
}

export async function markTaskStart(taskNumber) {
  const sid = getSid();
  if (!sid) return;
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("experiment_task_events")
    .select("id, started_at")
    .eq("session_id", sid)
    .eq("task_number", taskNumber)
    .maybeSingle();
  if (existing?.started_at) return; // already started — idempotent
  if (existing) {
    await supabase.from("experiment_task_events").update({ started_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await supabase.from("experiment_task_events").insert({ session_id: sid, task_number: taskNumber, started_at: new Date().toISOString() });
  }
}

export async function markTaskEnd(taskNumber) {
  const sid = getSid();
  if (!sid) return;
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("experiment_task_events")
    .select("id, ended_at")
    .eq("session_id", sid)
    .eq("task_number", taskNumber)
    .maybeSingle();
  if (existing?.ended_at) return; // already ended — idempotent, e.g. a duplicate form submit
  if (existing) {
    await supabase.from("experiment_task_events").update({ ended_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    // Defensive — every task should already have a start row from
    // markTaskStart, but a missing one must never block recording the end.
    await supabase
      .from("experiment_task_events")
      .insert({ session_id: sid, task_number: taskNumber, started_at: new Date().toISOString(), ended_at: new Date().toISOString() });
  }
  if (taskNumber === 4) {
    await supabase.from("experiment_sessions").update({ completed_at: new Date().toISOString() }).eq("id", sid);
  }
}

// Task 1 ends the moment signup succeeds — also the first point a real
// user_id exists, so this both closes Task 1 and links the session to the
// new account in one step.
export async function completeExperimentTask1() {
  const sid = getSid();
  if (!sid) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) await supabase.from("experiment_sessions").update({ user_id: user.id }).eq("id", sid);
  await markTaskEnd(1);
}

// Polled every ~2.5s by the on-screen timer while the experiment is active.
// Doubles as the trigger point for both pieces of background "stagecraft" —
// this is genuinely opportunistic (runs whenever the participant has any
// page open), not a cron job.
export async function getExperimentStatus() {
  const sid = getSid();
  if (!sid) return { active: false };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: session } = await supabase
    .from("experiment_sessions")
    .select("id, completed_at")
    .eq("id", sid)
    .maybeSingle();
  if (!session) return { active: false };

  if (user && !session.completed_at) {
    await runBackgroundChecks(supabase, user.id);
  }

  const { data: tasks } = await supabase
    .from("experiment_task_events")
    .select("task_number, started_at, ended_at")
    .eq("session_id", sid);
  const open = (tasks || []).find((t) => t.started_at && !t.ended_at);

  return {
    active: true,
    completed: !!session.completed_at,
    taskNumber: open?.task_number || null,
    startedAt: open?.started_at || null,
  };
}

// Task 2's trick: if the participant has a real pending request that's sat
// for 20s+, quietly run the real accept for them (see schema_v14.sql's
// experiment_auto_accept — RLS normally reserves this for the leader, so it
// has to go through that RPC rather than the plain acceptRequest() action).
// Task 3/4's trick, reversed: if they now lead a brand-new group with zero
// requests, seed 4 from the demo personas (experiment_seed_applicants).
async function runBackgroundChecks(supabase, userId) {
  try {
    const { data: pending } = await supabase
      .from("join_requests")
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (pending && Date.now() - new Date(pending.created_at).getTime() > 20_000) {
      await supabase.rpc("experiment_auto_accept", { p_request_id: pending.id });
    }
  } catch {}

  try {
    const { data: myGroups } = await supabase.from("groups").select("id").eq("leader_id", userId).limit(5);
    for (const g of myGroups || []) {
      const { count } = await supabase
        .from("join_requests")
        .select("id", { count: "exact", head: true })
        .eq("group_id", g.id);
      if (!count) {
        await supabase.rpc("experiment_seed_applicants", { p_group_id: g.id });
        break; // one group seeded is enough — this participant only ever forms one
      }
    }
  } catch {}
}

// Results screen, after Task 4 closes the session.
export async function getExperimentResults() {
  const sid = getSid();
  if (!sid) return null;
  const supabase = createClient();
  const { data: tasks } = await supabase
    .from("experiment_task_events")
    .select("task_number, started_at, ended_at")
    .eq("session_id", sid)
    .order("task_number", { ascending: true });
  return (tasks || []).map((t) => ({
    task: t.task_number,
    seconds: t.started_at && t.ended_at ? Math.round((new Date(t.ended_at) - new Date(t.started_at)) / 1000) : null,
  }));
}
