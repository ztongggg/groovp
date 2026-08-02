"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { createProject } from "@/app/create/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 py-4 text-[16px] font-bold text-white disabled:opacity-60"
    >
      {pending ? "Creating…" : "Create Project"}
    </button>
  );
}

const inputCls =
  "rounded-2xl border border-line bg-bgapp px-4 py-3.5 text-[15px] text-navy focus:border-purple-600 focus:outline-none";

export default function CreateProjectPage() {
  const [state, formAction] = useFormState(createProject, {});

  return (
    <div className="min-h-full bg-white px-6 pb-10 pt-14">
      <Link href="/discover" className="text-[15px] font-semibold text-muted">
        ‹ Back
      </Link>
      <h1 className="mt-3 text-[28px] font-extrabold text-navy">Create a project</h1>
      <p className="mt-1 text-[15px] text-muted">Fill the basics — you can refine later.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-3">
        <input name="name" required placeholder="Project name" className={inputCls} />
        <textarea name="description" rows={3} placeholder="Description" className={inputCls} />

        <select name="type" className={inputCls} defaultValue="academic">
          <option value="academic">Academic / Coursework</option>
          <option value="personal">Personal / Custom</option>
        </select>

        <input name="skills" placeholder="Skills needed (comma separated)" className={inputCls} />

        <div className="flex gap-3">
          <input name="min_size" type="number" min="1" placeholder="Min size" className={`${inputCls} w-1/2`} />
          <input name="max_size" type="number" min="1" placeholder="Max size" className={`${inputCls} w-1/2`} />
        </div>

        <div className="flex gap-3">
          <input name="timeline_start" type="date" className={`${inputCls} w-1/2`} />
          <input name="timeline_end" type="date" className={`${inputCls} w-1/2`} />
        </div>

        {state?.error && (
          <p className="text-[14px] font-medium text-badge-declinedText">{state.error}</p>
        )}

        <Submit />
      </form>
    </div>
  );
}
