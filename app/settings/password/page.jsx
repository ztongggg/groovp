import AppShell from "@/components/AppShell";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import Link from "next/link";

// Figma "Change Password" — dedicated screen, was previously an inline card on /settings.
export default function ChangePasswordPage() {
  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <div className="flex items-center gap-3 px-6">
          <Link href="/settings" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1d1b44" }}>Change Password</h1>
        </div>
        <p className="mt-2 px-6 text-[13px] text-muted">Choose a strong password you don&apos;t use elsewhere.</p>
        <div className="mt-5 px-6">
          <ChangePasswordForm />
        </div>
      </div>
    </AppShell>
  );
}
