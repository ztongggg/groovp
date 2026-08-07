import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import ConnectLinkedIn from "@/components/ConnectLinkedIn";
import ConnectGitHub from "@/components/ConnectGitHub";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

const PersonIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>);
const KeyIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.5 12.5 8-8M16 6l2 2M19 3l2 2" /></svg>);
const BellIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>);
const LockIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>);
const HelpIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" /><circle cx="12" cy="17" r=".5" fill="#1d1b44" /></svg>);
const LogoutIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D44C52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>);
const BlockIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D1B44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m6.3 6.3 11.4 11.4" /></svg>);
const ShieldIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D1B44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /></svg>);

function Row({ href, icon, label, badge }) {
  return (
    <Link href={href} style={{ height: 58, display: "flex", alignItems: "center", gap: 16, padding: "0 19px" }}>
      {icon}
      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#1D1B44" }}>{label}</span>
      {badge}
      <span style={{ fontSize: 18, fontWeight: 700, color: "#757080" }}>›</span>
    </Link>
  );
}
function Section({ label, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <p style={{ marginBottom: 8, marginLeft: 4, fontSize: 11, fontWeight: 700, color: "#757080" }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", borderRadius: 16, background: "#fff", border: "1px solid #F3F1F8" }}>
        {Array.isArray(children)
          ? children.filter(Boolean).map((child, i, arr) => (
              <div key={i} style={i < arr.length - 1 ? { borderBottom: "1px solid #F3F1F8" } : undefined}>{child}</div>
            ))
          : children}
      </div>
    </div>
  );
}

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
  const { isAdmin, linkedin, github } = await getAccount();

  return (
    <AppShell>
      <div className="min-h-full bg-bgapp pb-8">
        <StatusBar />
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 24px" }}>
          <Link href="/profile" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }}>‹</Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1D1B44" }}>Settings</h1>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          <Section label="ACCOUNT">
            <Row href="/edit-profile" icon={<PersonIcon />} label="Edit Profile" />
            <Row href="/settings/password" icon={<KeyIcon />} label="Change Password" />
          </Section>

          <div className="mt-3 flex flex-col gap-3">
            <ConnectLinkedIn verified={linkedin} />
            <ConnectGitHub verified={github} />
          </div>

          <Section label="PREFERENCES">
            <Row href="/settings/notifications" icon={<BellIcon />} label="Notification Preferences" />
            <Row href="/settings/privacy" icon={<LockIcon />} label="Privacy" />
          </Section>

          <Section label="SUPPORT">
            <Row href="/settings/help" icon={<HelpIcon />} label="Help & Support" />
            <Row href="/settings/blocked" icon={<BlockIcon />} label="Blocked Users" />
            {isAdmin && <Row href="/moderation" icon={<ShieldIcon />} label="Moderation queue" />}
          </Section>

          <form action={signOut} style={{ marginTop: 22 }}>
            <button type="submit" style={{ width: "100%", height: 58, borderRadius: 16, background: "#FAE0E0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#BF4247" }}>
              <LogoutIcon /> Log Out
            </button>
          </form>

          <p style={{ marginTop: 32, textAlign: "center", fontSize: 11, color: "#757080" }}>Groovp v1.0.0</p>
        </div>
      </div>
    </AppShell>
  );
}
