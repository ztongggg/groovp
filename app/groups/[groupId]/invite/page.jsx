import Link from "next/link";
import AppShell from "@/components/AppShell";
import InviteMemberSearch from "@/components/InviteMemberSearch";

export default function InviteMemberPage({ params }) {
  return (
    <AppShell>
      <div className="min-h-full bg-bgapp pb-8">
        <div className="flex items-center gap-3 px-6">
          <Link href={`/groups/${params.groupId}/edit`} className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Invite a Member</h1>
        </div>
        <p className="mt-2 px-6 text-[12.5px] text-muted">Search by name or username to add someone directly.</p>

        <InviteMemberSearch groupId={params.groupId} />
      </div>
    </AppShell>
  );
}
