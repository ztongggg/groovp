"use client";

import PreferenceToggle from "@/components/PreferenceToggle";
import { updatePrivacyPref } from "@/app/settings/privacy/actions";

export default function PrivacyForm({ prefs }) {
  return (
    <div className="mt-5 flex flex-col gap-3 px-6">
      <p className="text-[11.5px] font-bold uppercase tracking-wide text-muted">Other settings</p>
      <PreferenceToggle
        label="Show my ratings publicly"
        sub="When off, other people see 'Ratings are private' instead of your star average and reviews. You can always see your own."
        initial={prefs.show_ratings_publicly}
        onSave={(v) => updatePrivacyPref("show_ratings_publicly", v)}
      />
      <PreferenceToggle
        label="Allow others to message me first"
        sub="When off, only people you already have a conversation with can message you — others won't be able to start a new chat."
        initial={prefs.allow_message_first}
        onSave={(v) => updatePrivacyPref("allow_message_first", v)}
      />
    </div>
  );
}
