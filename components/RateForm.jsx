"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitRating } from "@/app/rate/actions";

export default function RateForm({ rateeId, name, projectId }) {
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [state, setState] = useState("idle"); // idle | saving | done | error
  const [msg, setMsg] = useState("");

  async function submit() {
    if (!stars) return;
    setState("saving");
    const res = await submitRating(rateeId, projectId, stars, comment);
    if (res?.error) {
      setState("error");
      setMsg(res.error);
      return;
    }
    setState("done");
    router.refresh();
  }

  if (state === "done") {
    return <div className="rounded-2xl border border-line bg-white p-5 text-[15px] font-semibold text-[#298c52]">Thanks — your rating was saved ✓</div>;
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[15px] font-bold text-navy">Rate {name}</p>
      <div className="mt-3 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setStars(n)} style={{ fontSize: 28, lineHeight: 1, color: (hover || stars) >= n ? "#f5b301" : "#d6d3de" }}>★</button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Add a comment (optional)" className="mt-3 w-full rounded-xl border border-line bg-bgapp px-3 py-2.5 text-[14px] text-navy focus:outline-none" />
      {state === "error" && <p className="mt-2 text-[13px] text-badge-declinedText">{msg}</p>}
      <button onClick={submit} disabled={!stars || state === "saving"} className="mt-3 w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 py-3 text-[15px] font-bold text-white disabled:opacity-50">
        {state === "saving" ? "Saving…" : "Submit rating"}
      </button>
    </div>
  );
}
