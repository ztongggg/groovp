"use client";

import PreferenceToggle from "@/components/PreferenceToggle";
import { updateNotificationPrefs } from "@/app/settings/notifications/actions";

function Section({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

export default function NotificationPrefsForm({ prefs }) {
  return (
    <div className="mt-5 flex flex-col gap-5 px-6">
      <Section label="Activity">
        <PreferenceToggle
          label="Join requests"
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
        <PreferenceToggle
          label="Messages"
          sub="New chat messages"
          initial={prefs.notify_new_message}
          onSave={(v) => updateNotificationPrefs("notify_new_message", v)}
        />
        <PreferenceToggle
          label="Rating reminders"
          sub="When a project you were on ends and needs ratings"
          initial={prefs.notify_rate_reminder}
          onSave={(v) => updateNotificationPrefs("notify_rate_reminder", v)}
        />
      </Section>
    </div>
  );
}
