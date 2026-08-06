import Link from "next/link";
import AppShell from "@/components/AppShell";
import StatusBar from "@/components/StatusBar";

const FAQS = [
  { q: "How does matching work?", a: "Groovp compares your skills, interests, and personality against what a project or group is looking for. A ✨ Strong Match badge shows when there's meaningful overlap — the specific matching skills/interests are highlighted." },
  { q: "How do I join a project?", a: "Open a project from Discover, then request to join a group (or the project directly, if it's a single-group Personal project). Leaders review requests from their Requests tab." },
  { q: "Can I be in multiple groups?", a: "Yes, across different projects. Academic projects can also have multiple independent groups running in parallel." },
  { q: "How do I leave a group?", a: "Open the group's chat, tap the gear icon for Group Info, and use Leave Group. Group leaders need to transfer leadership or end the project first." },
  { q: "Someone's bothering me — what do I do?", a: "Open their profile, tap the ⋯ menu, and Report or Block them. Blocking hides them from you immediately and cancels any pending request between you." },
];

export default function HelpSupportPage() {
  return (
    <AppShell>
      <div className="min-h-full bg-bgapp pb-8">
        <StatusBar />
        <div className="flex items-center gap-3 px-6">
          <Link href="/settings" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Help &amp; Support</h1>
        </div>

        <div className="mt-5 flex flex-col gap-3 px-6">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-2xl border border-line bg-white p-4">
              <p className="text-[14.5px] font-bold text-navy">{f.q}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.a}</p>
            </div>
          ))}

          <div className="mt-2 rounded-2xl bg-[#f5f0ff] p-4">
            <p className="text-[13px] font-bold uppercase tracking-wide text-purple-600">Still stuck?</p>
            <p className="mt-1 text-[13.5px] text-navy">Email us at <span className="font-semibold">support@groovp.app</span> and we&apos;ll get back to you.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
