"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingQuiz } from "@/components/onboarding/onboarding-quiz";
import { useProgressStore } from "@/lib/progress/store";
import type { LearningPath } from "@/lib/content/schemas";

export default function OnboardingClient({
  paths,
}: {
  paths: LearningPath[];
}) {
  const router = useRouter();
  const onboardingComplete = useProgressStore(
    (state) => state.progress.onboardingComplete,
  );
  const hydrated = useProgressStore((state) => state.hydrated);

  useEffect(() => {
    if (hydrated && onboardingComplete) {
      router.replace("/");
    }
  }, [hydrated, onboardingComplete, router]);

  return <OnboardingQuiz paths={paths} />;
}
