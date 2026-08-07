import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import StartGroupForm from "@/components/StartGroupForm";
import { createClient } from "@/lib/supabase/server";

async function getProjectName(id) {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("projects").select("name").eq("id", id).single();
    return data?.name || "";
  } catch {
    return "";
  }
}

export default async function NewGroupPage({ params }) {
  const projectName = await getProjectName(params.id);

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <StatusBar />
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 24px" }}>
          <Link href={`/project/${params.id}`} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }}>‹</Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1D1B44" }}>Start a New Group</h1>
        </div>
        <StartGroupForm projectId={params.id} projectName={projectName} />
      </div>
    </AppShell>
  );
}
