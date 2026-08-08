import SignupForm from "@/components/SignupForm";
import { getExperimentCondition } from "@/lib/experiment"; // EXPERIMENT: see lib/experiment.js

export default async function SignupPage() {
  const condition = await getExperimentCondition();
  return <SignupForm isNeutral={condition === "neutral"} />;
}
