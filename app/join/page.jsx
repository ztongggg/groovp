import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import JoinCodeForm from "@/components/JoinCodeForm";

export const dynamic = "force-dynamic";

export default function JoinPage({ searchParams }) {
  const initialCode = searchParams?.code || "";

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/home" className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1e1b4b" }}>Join a project</h1>
        </div>
        <p className="mt-2 px-6 text-[14px] text-muted">
          Enter the code your project owner shared to join their project. You'll then be able to form or join a group.
        </p>
        <JoinCodeForm initialCode={initialCode} />
      </div>
    </AppShell>
  );
}
