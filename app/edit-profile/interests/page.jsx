import AppShell from "@/components/AppShell";
import EditInterestsForm from "@/components/EditInterestsForm";
import { createClient } from "@/lib/supabase/server";

async function getInterests() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data: p } = await supabase.from("profiles").select("interests").eq("id", user.id).single();
    return p?.interests || [];
  } catch {
    return [];
  }
}

export default async function EditInterestsPage() {
  const interests = await getInterests();
  return (
    <AppShell>
      <div className="min-h-full bg-white pb-6">
        <EditInterestsForm initial={interests} />
      </div>
    </AppShell>
  );
}
