import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import BlockedUserRow from "@/components/BlockedUserRow";
import { createClient } from "@/lib/supabase/server";

async function getBlocked() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: blocks } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", user.id);
    if (!blocks || blocks.length === 0) return [];

    const ids = blocks.map((b) => b.blocked_id);
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, username").in("id", ids);
    const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

    return ids.map((id) => ({ id, name: byId[id]?.full_name || byId[id]?.username || "Someone" }));
  } catch {
    return [];
  }
}

export default async function BlockedUsersPage() {
  const blocked = await getBlocked();

  return (
    <AppShell>
      <div className="min-h-full bg-bgapp pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/settings" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Blocked Users</h1>
        </div>
        <p className="mt-2 px-6 text-[12.5px] text-muted">You won&apos;t see content from blocked users, and they can&apos;t contact you.</p>

        <div className="mt-5 flex flex-col gap-3 px-6">
          {blocked.length === 0 ? (
            <p className="mt-6 text-center text-[14px] text-muted">You haven&apos;t blocked anyone.</p>
          ) : (
            blocked.map((b) => <BlockedUserRow key={b.id} userId={b.id} name={b.name} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
