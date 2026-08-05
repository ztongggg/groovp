"use client";

import PreferenceToggle from "@/components/PreferenceToggle";
import { updateNotificationPrefs } from "@/app/settings/notifications/actions";

export default function NotificationPrefsForm({ prefs }) {
  return (
    <div className="mt-5 flex flex-col gap-3 px-6">
      <PreferenceToggle
        label="New join requests"
        sub="When someone requests to join a group you lead"
        initial={prefs.notify_join_requests}
        onSave={(v) => updateNotificationPrefs("notify_join_requests", v)}
      />
      <PreferenceToggle
        label="Join accepted"
        sub="When you're accepted into a group, or someone joins/accepts your invite"
        initial={prefs.notify_join_accepted}
        onSave={(v) => updateNotificationPrefs("notify_join_accepted", v)}
      />
      <PreferenceToggle
        label="Invites"
        sub="When a group leader invites you directly"
        initial={prefs.notify_invites}
        onSave={(v) => updateNotificationPrefs("notify_invites", v)}
      />
    </div>
  );
}
