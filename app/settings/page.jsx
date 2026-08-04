import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import ConnectLinkedIn from "@/components/ConnectLinkedIn";
import ConnectGitHub from "@/components/ConnectGitHub";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

async function getAccount() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { name: "Student", handle: "student", isAdmin: false, linkedin: false };
    const { data: p } = await supabase.from("profiles").select("full_name, username, is_admin, linkedin_verified, github_verified").eq("id", user.id).single();
    const emailName = (user.email || "student").split("@")[0];
    return { name: p?.full_name || emailName, handle: p?.username || emailName, isAdmin: !!p?.is_admin, linkedin: !!p?.linkedin_verified, github: !!p?.github_verified };
  } catch {
    return { name: "Student", handle: "student", isAdmin: false, linkedin: false, github: false };
  }
}

export default async function SettingsPage() {
  const { name, handle, isAdmin, linkedin, github } = await getAccount();

  return (
    <AppShell>
      <div className="min-h-full bg-bgapp pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/profile" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Settings</h1>
        </div>

        <div className="mt-5 flex flex-col gap-4 px-6">
          {/* account */}
          <Link href="/profile" className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-bold text-white" style={{ background: "#f29c38" }}>
              {(name || "?").slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-navy">{name}</p>
              <p className="truncate text-[13px] text-muted">@{handle}</p>
            </div>
            <span className="text-[18px] text-muted">›</span>
          </Link>

          <Link href="/edit-profile" className="flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4">
            <span className="text-[15px] font-semibold text-navy">Edit Profile</span>
            <span className="text-[18px] text-muted">›</span>
          </Link>

          <ChangePasswordForm />

          <ConnectLinkedIn verified={linkedin} />
          <ConnectGitHub verified={github} />

          {isAdmin && (
            <Link href="/moderation" className="flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4">
              <span className="text-[15px] font-semibold text-navy">Moderation queue</span>
              <span className="text-[18px] text-muted">›</span>
            </Link>
          )}

          {/* cosmetic section */}
          <div className="rounded-2xl border border-line bg-white">
            {["Notification preferences", "Privacy", "Help & Support"].map((row, i) => (
              <div key={row} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? "border-t border-line" : ""}`}>
                <span className="text-[15px] font-semibold text-navy">{row}</span>
                <span className="text-[18px] text-muted">›</span>
              </div>
            ))}
          </div>

          <form action={signOut}>
            <button type="submit" className="w-full rounded-2xl py-3.5 text-[15px] font-bold" style={{ background: "#fae0e0", color: "#bf4247" }}>Log Out</button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
