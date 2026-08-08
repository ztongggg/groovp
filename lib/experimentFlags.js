// EXPERIMENT: plain constant, not a server action — kept out of
// lib/experiment.js because a "use server" file may only export async
// functions. Safe to import from client or server (NEXT_PUBLIC_ vars are
// inlined at build time either way).
export const EXPERIMENT_ENABLED = process.env.NEXT_PUBLIC_EXPERIMENT_ENABLED === "true";
