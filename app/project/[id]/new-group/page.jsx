import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import StartGroupForm from "@/components/StartGroupForm";

export default function NewGroupPage({ params }) {
  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href={`/project/${params.id}`} className="text-[22px] text-navy">‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Start a New Group</h1>
        </div>
        <StartGroupForm projectId={params.id} />
      </div>
    </AppShell>
  );
}
