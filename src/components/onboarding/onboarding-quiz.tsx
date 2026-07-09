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

const editorialPanel =
  "border-white/10 bg-[#0b0b0f] shadow-none ring-1 ring-white/5";
const editorialEyebrow =
  "text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]";
const mutedText = "text-[var(--color-muted)]";

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
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className={`relative overflow-hidden p-8 md:p-10 ${editorialPanel}`}>
        <div className="absolute -right-24 -top-24 size-72 rounded-full bg-yellow-400/10" />
        <div className="relative">
          <p className={editorialEyebrow}>
            Introspection · Step {step + 1} of {questions.length}
          </p>
          <h2 className="mt-5 max-w-3xl text-5xl font-extrabold leading-none tracking-tight md:text-7xl">
            {current.prompt}
          </h2>
          <p className={`mt-5 max-w-2xl text-lg leading-8 ${mutedText}`}>
            Choose the answer that feels closest today. This sets a starting path,
            not a permanent label.
          </p>
        </div>

        <div className="relative mt-8 grid gap-3">
          {current.options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => choose(option.pathId)}
              className="group flex min-h-14 w-full items-center justify-between rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-left text-lg font-semibold transition hover:border-[var(--color-accent)] hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
            >
              <span>{option.label}</span>
              <span className="text-sm uppercase tracking-[0.18em] text-foreground/40 transition group-hover:text-[var(--color-accent)]">
                Choose
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          onClick={skip}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
        >
          Choose a starter path for now
        </Button>
        {recommendedPath && (
          <p className={`text-sm ${mutedText}`}>
            Starter example:{" "}
            <span className="font-medium text-[var(--color-text)]">
              {recommendedPath.title}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
