"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LearningPath } from "@/lib/content/schemas";
import { useProgressStore } from "@/lib/progress/store";

const questions = [
  {
    id: "interest",
    prompt: "What kind of questions interest you most?",
    options: [
      { label: "Who am I?", pathId: "inner-peace-path" },
      { label: "What is justice?", pathId: "justice-path" },
      { label: "How does the universe work?", pathId: "questioners-path" },
      { label: "What makes life meaningful?", pathId: "creative-mind-path" },
      { label: "How do I become stronger?", pathId: "courage-path" },
    ],
  },
  {
    id: "type",
    prompt: "What kind of thinker are you?",
    options: [
      { label: "Rebel", pathId: "questioners-path" },
      { label: "Dreamer", pathId: "creative-mind-path" },
      { label: "Problem-solver", pathId: "questioners-path" },
      { label: "Leader", pathId: "courage-path" },
      { label: "Observer", pathId: "inner-peace-path" },
    ],
  },
  {
    id: "struggle",
    prompt: "What do you struggle with most?",
    options: [
      { label: "Confidence", pathId: "courage-path" },
      { label: "Focus", pathId: "inner-peace-path" },
      { label: "Pressure", pathId: "courage-path" },
      { label: "Purpose", pathId: "creative-mind-path" },
      { label: "Fitting in", pathId: "justice-path" },
    ],
  },
];

export function OnboardingQuiz({ paths }: { paths: LearningPath[] }) {
  const router = useRouter();
  const completeOnboarding = useProgressStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});

  const current = questions[step];

  function choose(pathId: string) {
    const nextScores = {
      ...scores,
      [pathId]: (scores[pathId] ?? 0) + 1,
    };
    setScores(nextScores);

    if (step === questions.length - 1) {
      const recommendedPathId =
        Object.entries(nextScores).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "questioners-path";
      completeOnboarding(recommendedPathId);
      router.push("/");
      return;
    }

    setStep(step + 1);
  }

  function skip() {
    completeOnboarding("questioners-path");
    router.push("/");
  }

  const recommendedPath =
    paths.find((path) => path.id === "questioners-path") ?? paths[0];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
          Onboarding
        </p>
        <h2 className="mt-3 text-3xl font-semibold">{current.prompt}</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Question {step + 1} of {questions.length}
        </p>
        <div className="mt-6 space-y-3">
          {current.options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => choose(option.pathId)}
              className="block w-full rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-4 text-left transition hover:border-[var(--color-accent)]"
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={skip}>
          Skip for now
        </Button>
      </div>
      {recommendedPath && (
        <p className="text-sm text-[var(--color-muted)]">
          Example path: {recommendedPath.title}
        </p>
      )}
    </div>
  );
}
