import { getAllPaths } from "@/lib/content/loaders";
import OnboardingClient from "./onboarding-client";

export default function OnboardingPage() {
  const paths = getAllPaths();
  return <OnboardingClient paths={paths} />;
}
