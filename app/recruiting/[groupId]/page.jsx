import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import RecruitingForm from "@/components/RecruitingForm";
import { createClient } from "@/lib/supabase/server";

async function getGroup(groupId) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: g } = await supabase
      .from("groups")
      .select("id, name, leader_id, project_id, recruiting, members_wanted, skills_wanted, personality_wanted, interests_wanted, additional_notes, joining_method")
      .eq("id", groupId)
      .single();
    return { g, me: user?.id || null };
  } catch {
    return { g: null, me: null };
  }
}

export default async function RecruitingPage({ params }) {
  const { g, me } = await getGroup(params.groupId);

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <StatusBar />
        <div className="mb-4 flex items-center gap-3 px-6">
          <Link href={g ? `/project/${g.project_id}` : "/teams"} className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>Recruiting</h1>
        </div>

        {!g ? (
          <p className="mt-24 px-8 text-center text-muted">Group not found.</p>
        ) : me !== g.leader_id ? (
          <p className="mt-24 px-8 text-center text-muted">Only the group leader can manage recruiting.</p>
        ) : (
          <RecruitingForm groupId={g.id} initial={g} />
        )}
      </div>
    </AppShell>
  );
}
