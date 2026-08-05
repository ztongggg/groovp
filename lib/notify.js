// Shared notification-preference gate. Defaults to true (notify) on any error —
// a missing/unreadable pref should never silently suppress a real notification.
export async function shouldNotify(supabase, userId, prefColumn) {
  try {
    const { data } = await supabase.from("profiles").select(prefColumn).eq("id", userId).single();
    return data?.[prefColumn] !== false;
  } catch {
    return true;
  }
}
