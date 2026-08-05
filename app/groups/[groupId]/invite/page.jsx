import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import InviteMemberSearch from "@/components/InviteMemberSearch";

export default function InviteMemberPage({ params }) {
  return (
    <AppShell>
      <div className="min-h-full bg-bgapp pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href={`/groups/${params.groupId}/edit`} className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Invite a Member</h1>
        </div>
        <p className="mt-2 px-6 text-[12.5px] text-muted">Search by name or username to add someone directly.</p>

        <InviteMemberSearch groupId={params.groupId} />
      </div>
    </AppShell>
  );
}
