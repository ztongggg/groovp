import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";
import ReportUserForm from "@/components/ReportUserForm";
import { createClient } from "@/lib/supabase/server";

async function getName(id) {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("full_name, username").eq("id", id).single();
    return data?.full_name || data?.username || "this user";
  } catch {
    return "this user";
  }
}

export default async function ReportUserPage({ params }) {
  const name = await getName(params.id);

  return (
    <AppShell>
      <div className="min-h-full bg-white pb-8">
        <StatusBar />
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 24px" }}>
          <Link href={`/u/${params.id}`} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }}>‹</Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1D1B44" }}>Report {name}</h1>
        </div>
        <ReportUserForm userId={params.id} name={name} />
      </div>
    </AppShell>
  );
}
