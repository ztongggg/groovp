import Link from "next/link";
import AppShell from "@/components/AppShell";
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
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 24px" }}>
          <Link href={g ? `/groups/${g.id}` : "/teams"} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }}>‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1D1B44" }}>Recruiting settings</h1>
        </div>

        {!g ? (
          <p className="mt-24 px-8 text-center text-muted">Group not found.</p>
        ) : me !== g.leader_id ? (
          <p className="mt-24 px-8 text-center text-muted">Only the group leader can manage recruiting.</p>
        ) : (
          <>
            <RecruitingForm groupId={g.id} groupName={g.name} initial={g} />
            <div className="px-6">
              <InviteByUsername groupId={g.id} />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
