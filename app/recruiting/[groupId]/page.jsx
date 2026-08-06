import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import RecruitingForm from "@/components/RecruitingForm";
import InviteByUsername from "@/components/InviteByUsername";
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
          <Link href={g ? `/project/${g.project_id}` : "/teams"} className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Recruiting settings</h1>
        </div>
        {g && <p className="mb-4 px-6 text-[13px] text-muted">Control whether people can request to join {g.name}.</p>}

        {!g ? (
          <p className="mt-24 px-8 text-center text-muted">Group not found.</p>
        ) : me !== g.leader_id ? (
          <p className="mt-24 px-8 text-center text-muted">Only the group leader can manage recruiting.</p>
        ) : (
          <>
            <RecruitingForm groupId={g.id} initial={g} />
            <div className="px-6">
              <InviteByUsername groupId={g.id} />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
