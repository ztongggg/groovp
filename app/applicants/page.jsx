import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import ApplicantCard from "@/components/ApplicantCard";
import { createClient } from "@/lib/supabase/server";

async function getApplicants() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // groups I lead
    const { data: groups } = await supabase
      .from("groups")
      .select("id, name, projects(name)")
      .eq("leader_id", user.id);
    if (!groups || groups.length === 0) return [];

    const groupIds = groups.map((g) => g.id);
    const byId = Object.fromEntries(groups.map((g) => [g.id, g]));

    const { data: reqs } = await supabase
      .from("join_requests")
      .select("id, group_id, user_id, comment, created_at, profiles:user_id(full_name, username, skills)")
      .in("group_id", groupIds)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    return (reqs || []).map((r) => ({
      id: r.id,
      groupId: r.group_id,
      applicantId: r.user_id,
      name: r.profiles?.full_name || r.profiles?.username || "Someone",
      username: r.profiles?.username || "user",
      skills: r.profiles?.skills || [],
      comment: r.comment,
      group: byId[r.group_id]?.name || "Group",
      project: byId[r.group_id]?.projects?.name || "your project",
    }));
  } catch {
    return [];
  }
}

export default async function ApplicantsPage() {
  const applicants = await getApplicants();

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/home" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Requests</h1>
        </div>

        {applicants.length === 0 ? (
          <div className="mt-24 px-8 text-center">
            <p className="text-[16px] font-semibold text-navy">No pending requests</p>
            <p className="mt-1 text-[14px] text-muted">When people ask to join your projects, they show up here.</p>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-4 px-6">
            {applicants.map((a) => <ApplicantCard key={a.id} {...a} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}
