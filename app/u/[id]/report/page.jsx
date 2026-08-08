import AppShell from "@/components/AppShell";
import ReportUserForm from "@/components/ReportUserForm";
import BackButton from "@/components/BackButton";
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
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 24px" }}>
          <BackButton fallbackHref={`/u/${params.id}`} style={{ width: 40, height: 40, borderRadius: 9999, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#1D1B44" }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1D1B44" }}>Report {name}</h1>
        </div>
        <ReportUserForm userId={params.id} name={name} />
      </div>
    </AppShell>
  );
}
