import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import ConnectLinkedIn from "@/components/ConnectLinkedIn";
import ConnectGitHub from "@/components/ConnectGitHub";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

const PersonIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>);
const KeyIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.5 12.5 8-8M16 6l2 2M19 3l2 2" /></svg>);
const BellIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>);
const LockIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>);
const HelpIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1b44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" /><circle cx="12" cy="17" r=".5" fill="#1d1b44" /></svg>);
const LogoutIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bf4247" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>);

function Row({ href, icon, label, badge }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-4">
      {icon}
      <span className="flex-1 text-[14.5px] font-bold text-navy">{label}</span>
      {badge}
      <span className="text-[16px] text-muted">›</span>
    </Link>
  );
}
function Section({ label, children }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <div className="flex flex-col divide-y divide-[#f3f1f8] rounded-2xl bg-white" style={{ boxShadow: "0px 2px 8px rgba(26,20,51,0.06)" }}>
        {children}
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
        <div className="flex items-center gap-3 px-6">
          <Link href="/profile" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Settings</h1>
        </div>

        <div className="px-6 pb-6">
          <Section label="Account">
            <Row href="/edit-profile" icon={<PersonIcon />} label="Edit Profile" />
            <Row href="/settings/password" icon={<KeyIcon />} label="Change Password" />
          </Section>

          <div className="mt-3 flex flex-col gap-3">
            <ConnectLinkedIn verified={linkedin} />
            <ConnectGitHub verified={github} />
          </div>

          <Section label="Preferences">
            <Row href="/settings/notifications" icon={<BellIcon />} label="Notification Preferences" />
            <Row href="/settings/privacy" icon={<LockIcon />} label="Privacy" />
          </Section>

          <Section label="Support">
            <Row href="/settings/help" icon={<HelpIcon />} label="Help & Support" />
            <Row href="/settings/blocked" icon={<span style={{ width: 18 }} />} label="Blocked Users" />
            {isAdmin && <Row href="/moderation" icon={<span style={{ width: 18 }} />} label="Moderation queue" />}
          </Section>

          <form action={signOut} className="mt-5">
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold" style={{ background: "#fae0e0", color: "#bf4247" }}>
              <LogoutIcon /> Log Out
            </button>
          </form>

          <p className="mt-8 text-center text-[12px] text-muted">Groovp v1.0.0</p>
        </div>
      </div>
    </AppShell>
  );
}
