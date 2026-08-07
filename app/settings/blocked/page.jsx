import Link from "next/link";
import AppShell from "@/components/AppShell";
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
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, username, avatar_url").in("id", ids);
    const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

    return ids.map((id) => ({ id, name: byId[id]?.full_name || byId[id]?.username || "Someone", avatarUrl: byId[id]?.avatar_url || "" }));
  } catch {
    return [];
  }
}

export default async function BlockedUsersPage() {
  const blocked = await getBlocked();

  return (
    <AppShell>
      <div className="min-h-full pb-8" style={{ background: "#f9f8fb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 24px" }}>
          <Link href="/settings" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }}>‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1D1B44" }}>Blocked Users</h1>
        </div>
        <p style={{ marginTop: 14, padding: "0 24px", fontSize: 12, color: "#757080", lineHeight: "18px" }}>You won&apos;t see content from blocked users, and they can&apos;t contact you.</p>

        <div style={{ marginTop: 18, padding: "0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          {blocked.length === 0 ? (
            <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#757080" }}>You haven&apos;t blocked anyone.</p>
          ) : (
            blocked.map((b, i) => <BlockedUserRow key={b.id} userId={b.id} name={b.name} avatarUrl={b.avatarUrl} index={i} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}
