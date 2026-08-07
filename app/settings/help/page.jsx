import Link from "next/link";
import AppShell from "@/components/AppShell";

const FAQS = [
  { q: "How does matching work?", a: "Groovp compares your skills, interests, and personality against what a project or group is looking for. A ✨ Strong Match badge shows when there's meaningful overlap — the specific matching skills/interests are highlighted." },
  { q: "How do I join a project?", a: "Open a project from Discover, then request to join a group (or the project directly, if it's a single-group Personal project). Leaders review requests from their Requests tab." },
  { q: "Can I be in multiple groups?", a: "Yes, across different projects. Academic projects can also have multiple independent groups running in parallel." },
  { q: "How do I leave a group?", a: "Open the group's chat, tap the gear icon for Group Info, and use Leave Group. Group leaders need to transfer leadership or end the project first." },
  { q: "Someone's bothering me — what do I do?", a: "Open their profile, tap the ⋯ menu, and Report or Block them. Blocking hides them from you immediately and cancels any pending request between you." },
];

function Row({ children }) {
  return <div className="rounded-2xl bg-[#f3f1f8] px-4 py-4">{children}</div>;
}
function Disclosure({ summary, children }) {
  return (
    <Row>
      <details>
        <summary className="flex cursor-pointer list-none items-center justify-between text-[14.5px] font-bold text-navy">
          {summary}
          <span className="text-[16px] text-muted">›</span>
        </summary>
        <div className="mt-3 flex flex-col gap-3 text-[13px] leading-relaxed text-muted">{children}</div>
      </details>
    </Row>
  );
}

export default function HelpSupportPage() {
  return (
    <AppShell>
      <div className="min-h-full pb-8" style={{ background: "#f9f8fb" }}>
        <div className="flex items-center gap-3 px-6">
          <Link href="/settings" className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: "#fff", boxShadow: "0px 2px 8px rgba(26,20,51,0.10)" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#1d1b44" }}>‹</span></Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1b44" }}>Help &amp; Support</h1>
        </div>

        <div className="px-6">
          <p className="mb-2 mt-5 text-[11.5px] font-bold uppercase tracking-wide text-muted">Resources</p>
          <div className="flex flex-col gap-2.5">
            <Disclosure summary="Frequently Asked Questions">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <p className="font-bold text-navy">{f.q}</p>
                  <p className="mt-0.5">{f.a}</p>
                </div>
              ))}
            </Disclosure>
            <Disclosure summary="How Groovp matching works">
              <p>Groovp compares your skills, interests, and personality against what a project or group is looking for. A ✨ Strong Match badge shows when there&apos;s meaningful overlap, and the specific matching skills/interests are highlighted wherever you see that group or project.</p>
            </Disclosure>
            <Disclosure summary="Community guidelines">
              <p>Be honest about your skills and availability. Respect leaders&apos; decisions on join requests. Keep project chats on-topic and professional. Report or block anyone who makes you uncomfortable — leaders and moderators review every report.</p>
            </Disclosure>
          </div>

          <p className="mb-2 mt-5 text-[11.5px] font-bold uppercase tracking-wide text-muted">Get in touch</p>
          <div className="flex flex-col gap-2.5">
            <Row>
              <a href="mailto:support@groovp.app" className="flex items-center justify-between text-[14.5px] font-bold text-navy">Contact support<span className="text-[16px] text-muted">›</span></a>
            </Row>
            <Row>
              <a href="mailto:support@groovp.app?subject=Report%20a%20problem" className="flex items-center justify-between text-[14.5px] font-bold text-navy">Report a problem<span className="text-[16px] text-muted">›</span></a>
            </Row>
          </div>

          <div className="mt-5 rounded-2xl bg-[#f3f1f8] px-4 py-4 text-center text-[12px] text-muted">Groovp version 1.0.0</div>
        </div>
      </div>
    </AppShell>
  );
}
