import { redirect } from "next/navigation";

export default function Home() {
  // Land on the Home tab; onboarding/login will become the entry point later.
  redirect("/home");
}
