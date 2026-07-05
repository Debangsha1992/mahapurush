import { getAllPaths } from "@/lib/content/loaders";
import OnboardingClient from "../onboarding/onboarding-client";

export default function IntrospectionPage() {
  const paths = getAllPaths();
  return <OnboardingClient paths={paths} />;
}
