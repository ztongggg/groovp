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
          <Link href={`/project/${params.id}`} className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Start a New Group</h1>
        </div>
        <StartGroupForm projectId={params.id} />
      </div>
    </AppShell>
  );
}
