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
  const selectedPathId = useProgressStore(
    (state) => state.progress.selectedPathId,
  );
  const hydrated = useProgressStore((state) => state.hydrated);

  useEffect(() => {
    if (hydrated && onboardingComplete) {
      const fallbackPath =
        paths.find((path) => path.id === "questioners-path") ?? paths[0];
      const selectedPath =
        paths.find((path) => path.id === selectedPathId) ?? fallbackPath;

      router.replace(
        selectedPath ? `/paths/${selectedPath.slug}` : "/paths/questioners-path",
      );
    }
  }, [hydrated, onboardingComplete, paths, router, selectedPathId]);

  return <OnboardingQuiz paths={paths} />;
}
