"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LESSON_STEPS,
  type Lesson,
  type LessonLayer,
  type LessonStepId,
} from "@/lib/content/schemas";
import { useProgressStore } from "@/lib/progress/store";

type LessonFlowProps = {
  lesson: Lesson;
  thinkerName: string;
  layerKey?: "quick" | "full";
};

export function LessonFlow({
  lesson,
  thinkerName,
  layerKey = "full",
}: LessonFlowProps) {
  const layer = lesson.layers[layerKey];
  const saveLessonStep = useProgressStore((state) => state.saveLessonStep);
  const addJournalEntry = useProgressStore((state) => state.addJournalEntry);
  const finishLesson = useProgressStore((state) => state.finishLesson);
  const lessonSteps = useProgressStore((state) => state.progress.lessonSteps);

  const initialStep = lessonSteps[lesson.id] ?? 0;
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [tensionResponse, setTensionResponse] = useState("");
  const [completed, setCompleted] = useState(false);

  const currentStep = LESSON_STEPS[stepIndex] ?? "reward";

  const canContinue = useMemo(() => {
    if (currentStep === "modernTest") {
      return Boolean(selectedOption);
    }
    if (currentStep === "reflection") {
      return reflection.trim().length >= 12;
    }
    if (currentStep === "thoughtTension") {
      return tensionResponse.trim().length >= 12;
    }
    return true;
  }, [currentStep, reflection, selectedOption, tensionResponse]);

  function goToStep(nextIndex: number) {
    setStepIndex(nextIndex);
    saveLessonStep(lesson.id, nextIndex);
  }

  function handleContinue() {
    if (currentStep === "reflection" && reflection.trim()) {
      addJournalEntry({
        id: `${lesson.id}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        thinkerId: lesson.thinkerId,
        lessonId: lesson.id,
        prompt: layer.reflectionPrompt,
        response: reflection.trim(),
        skillIds: layer.rewards.skills.map((skill) => skill.id),
      });
    }

    if (currentStep === "thoughtTension") {
      addJournalEntry({
        id: `${lesson.id}-tension-${Date.now()}`,
        createdAt: new Date().toISOString(),
        thinkerId: lesson.thinkerId,
        lessonId: lesson.id,
        prompt: layer.thoughtTension.responsePrompt,
        response: tensionResponse.trim(),
        skillIds: layer.rewards.skills.map((skill) => skill.id),
      });
      finishLesson(lesson.id, layer);
      setCompleted(true);
      goToStep(LESSON_STEPS.length - 1);
      return;
    }

    if (stepIndex < LESSON_STEPS.length - 1) {
      goToStep(stepIndex + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {thinkerName}
          </p>
          <h2 className="text-2xl font-semibold">{lesson.title}</h2>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Step {stepIndex + 1} / {LESSON_STEPS.length}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LESSON_STEPS.map((step, index) => (
          <span
            key={step}
            className={`rounded-full px-3 py-1 text-xs ${
              index === stepIndex
                ? "bg-[var(--color-accent)] text-[#101014]"
                : index < stepIndex
                  ? "bg-[var(--color-surface-raised)] text-[var(--color-text)]"
                  : "bg-[var(--color-surface)] text-[var(--color-muted)]"
            }`}
          >
            {index + 1}
          </span>
        ))}
      </div>

      <Card>{renderStep(currentStep, layer, {
        selectedOption,
        setSelectedOption,
        reflection,
        setReflection,
        tensionResponse,
        setTensionResponse,
        completed,
        thinkerName,
      })}</Card>

      <div className="flex flex-wrap gap-3">
        {stepIndex > 0 && (
          <Button variant="secondary" onClick={() => goToStep(stepIndex - 1)}>
            Back
          </Button>
        )}
        {currentStep !== "reward" && (
          <Button onClick={handleContinue} disabled={!canContinue}>
            Continue
          </Button>
        )}
        {currentStep === "reward" && (
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function renderStep(
  step: LessonStepId,
  layer: LessonLayer,
  state: {
    selectedOption: string | null;
    setSelectedOption: (value: string) => void;
    reflection: string;
    setReflection: (value: string) => void;
    tensionResponse: string;
    setTensionResponse: (value: string) => void;
    completed: boolean;
    thinkerName: string;
  },
) {
  switch (step) {
    case "hook":
      return (
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Hook
          </p>
          <p className="font-serif text-3xl leading-tight text-[var(--color-text)]">
            {layer.hook}
          </p>
        </div>
      );
    case "story":
      return (
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Human Story
          </p>
          <p className="text-lg leading-8 text-[var(--color-text)]">{layer.story}</p>
        </div>
      );
    case "bigIdea":
      return (
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Big Idea
          </p>
          <h3 className="text-2xl font-semibold">{layer.bigIdea.title}</h3>
          <p className="text-lg leading-8 text-[var(--color-muted)]">
            {layer.bigIdea.explanation}
          </p>
        </div>
      );
    case "thinkingTool":
      return (
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Thinking Tool
          </p>
          <h3 className="text-2xl font-semibold">{layer.thinkingTool.name}</h3>
          <p className="text-lg leading-8 text-[var(--color-muted)]">
            {layer.thinkingTool.instruction}
          </p>
        </div>
      );
    case "modernTest":
      return (
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Modern Test
          </p>
          <p className="text-lg leading-8">{layer.modernTest.scenario}</p>
          <p className="font-medium">{layer.modernTest.question}</p>
          <div className="space-y-3">
            {layer.modernTest.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => state.setSelectedOption(option.id)}
                className={`block w-full rounded-[1rem] border px-4 py-4 text-left transition ${
                  state.selectedOption === option.id
                    ? "border-[var(--color-accent)] bg-[rgba(217,154,43,0.12)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-accent)]"
                }`}
              >
                <span className="block font-medium">{option.label}</span>
                {state.selectedOption === option.id && (
                  <span className="mt-2 block text-sm text-[var(--color-muted)]">
                    {option.explanation}
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            {layer.modernTest.discussionNotes}
          </p>
        </div>
      );
    case "reflection":
      return (
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Reflection Challenge
          </p>
          <p className="text-lg leading-8">{layer.reflectionPrompt}</p>
          <textarea
            value={state.reflection}
            onChange={(event) => state.setReflection(event.target.value)}
            rows={6}
            className="w-full rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            placeholder="Write your response here..."
          />
        </div>
      );
    case "thoughtTension":
      return (
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Thought Tension
          </p>
          <p className="font-serif text-2xl leading-snug">{layer.thoughtTension.counterView}</p>
          <p className="text-lg leading-8">{layer.thoughtTension.responsePrompt}</p>
          <textarea
            value={state.tensionResponse}
            onChange={(event) => state.setTensionResponse(event.target.value)}
            rows={6}
            className="w-full rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            placeholder="Respond to the counter-view..."
          />
        </div>
      );
    case "reward":
      return (
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Reward
          </p>
          <h3 className="text-2xl font-semibold">
            {state.completed ? "Lesson complete" : "Ready for your reward"}
          </h3>
          <p className="text-lg text-[var(--color-muted)]">
            You practiced thinking with {state.thinkerName}.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1rem] bg-[var(--color-surface-raised)] p-4">
              <p className="text-sm text-[var(--color-muted)]">XP</p>
              <p className="text-2xl font-semibold">+{layer.rewards.xp + 15}</p>
            </div>
            {layer.rewards.badge && (
              <div className="rounded-[1rem] bg-[var(--color-surface-raised)] p-4">
                <p className="text-sm text-[var(--color-muted)]">Badge</p>
                <p className="text-lg font-semibold capitalize">
                  {layer.rewards.badge.replace(/-/g, " ")}
                </p>
              </div>
            )}
            <div className="rounded-[1rem] bg-[var(--color-surface-raised)] p-4">
              <p className="text-sm text-[var(--color-muted)]">Skills</p>
              <p className="text-lg font-semibold">
                {layer.rewards.skills.map((skill) => skill.id).join(", ")}
              </p>
            </div>
          </div>
        </div>
      );
  }
}
