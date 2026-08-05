"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { addPastProject } from "@/app/past-projects/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[16px] font-bold text-white disabled:opacity-60">
      {pending ? "Adding…" : "Add to profile"}
    </button>
  );
}

const cls = "rounded-2xl border border-line bg-bgapp px-4 py-3.5 text-[15px] text-navy focus:border-purple-600 focus:outline-none";

export default function AddPastProjectPage() {
  const [state, formAction] = useFormState(addPastProject, {});
  return (
    <div className="min-h-full bg-white px-6 pb-10 pt-14">
      <Link href="/profile" className="text-[15px] font-semibold text-muted">‹ Back</Link>
      <h1 className="mt-3 text-[26px] font-extrabold text-navy">Add a past project</h1>
      <p className="mt-1 text-[15px] text-muted">Show what you've worked on.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-3">
        <input name="role" placeholder="Title / your role (e.g. ML Engineer — NeuralLink) — optional" className={cls} />
        <textarea name="write_up" rows={4} placeholder="What did you build? What was your part?" className={cls} />
        {state?.error && <p className="text-[14px] font-medium text-badge-declinedText">{state.error}</p>}
        <Submit />
      </form>
    </div>
  );
}
