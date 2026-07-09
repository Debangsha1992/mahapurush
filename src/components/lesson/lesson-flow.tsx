"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  EditorialCard,
  editorialEyebrow,
  mutedText,
} from "@/components/ui/editorial";
import {
  LESSON_STEPS,
  LIFE_STORY_PAGE_COUNT,
  type Lesson,
  type LessonLayer,
  type LessonStepId,
  type LifeStoryPage,
} from "@/lib/content/schemas";
import { RotatingThinkerImage } from "@/components/ui/rotating-thinker-image";
import { useProgressStore } from "@/lib/progress/store";

type LessonFlowProps = {
  lesson: Lesson;
  thinkerName: string;
  thinkerSlug: string;
  desktopImages: string[];
  mobileImages: string[];
  galleryCaptions: string[];
  lifePages: LifeStoryPage[];
  layerKey?: "quick" | "full";
};

export function LessonFlow({
  lesson,
  thinkerName,
  thinkerSlug,
  desktopImages,
  mobileImages,
  galleryCaptions,
  lifePages,
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
  const lifePage = lifePages[stepIndex];
  const imageIndex = stepIndex % LIFE_STORY_PAGE_COUNT;

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
      <EditorialCard className="p-8 md:p-10">
        <div className="absolute -right-20 -top-20 size-52 rounded-full bg-yellow-400/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
          <RotatingThinkerImage
            slug={thinkerSlug}
            name={thinkerName}
            desktopImages={desktopImages.slice(0, LIFE_STORY_PAGE_COUNT)}
            mobileImages={mobileImages.slice(0, LIFE_STORY_PAGE_COUNT)}
            captions={galleryCaptions.slice(0, LIFE_STORY_PAGE_COUNT)}
            imageIndex={imageIndex}
            layout="portrait"
            size={200}
            priority
          />
          <div className="flex flex-1 items-start justify-between gap-4">
            <div>
              <p className={editorialEyebrow}>{thinkerName}</p>
              <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                {lesson.title}
              </h2>
            </div>
            <p className={`text-sm ${mutedText}`}>
              Step {stepIndex + 1} / {LESSON_STEPS.length}
            </p>
          </div>
        </div>
      </EditorialCard>

      <div className="flex flex-wrap gap-2">
        {LESSON_STEPS.map((step, index) => (
          <span
            key={step}
            className={`rounded-full px-3 py-1 text-xs ${
              index === stepIndex
                ? "bg-[var(--color-accent)] text-[#101014]"
                : index < stepIndex
                  ? "border border-white/10 bg-white/[0.08] text-[var(--color-text)]"
                  : "border border-white/10 bg-white/[0.04] text-foreground/50"
            }`}
          >
            {index + 1}
          </span>
        ))}
      </div>

      <EditorialCard>
        {renderStep(currentStep, layer, lifePage, {
          selectedOption,
          setSelectedOption,
          reflection,
          setReflection,
          tensionResponse,
          setTensionResponse,
          completed,
          thinkerName,
        })}
      </EditorialCard>

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
  lifePage: LifeStoryPage | undefined,
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
  const lifeStoryBlock = lifePage ? (
    <div className="space-y-4 border-b border-white/10 pb-6">
      <p className={editorialEyebrow}>Life Story</p>
      <h3 className="text-2xl font-extrabold tracking-tight">{lifePage.title}</h3>
      <p className="text-lg leading-8 text-[var(--color-text)]">{lifePage.body}</p>
    </div>
  ) : null;

  switch (step) {
    case "hook":
      return (
        <div className="space-y-6">
          {lifeStoryBlock}
          <div className="space-y-4">
            <p className={editorialEyebrow}>Hook</p>
            <p className="font-serif text-3xl leading-tight text-[var(--color-text)]">
              {layer.hook}
            </p>
          </div>
        </div>
      );
    case "story":
      return (
        <div className="space-y-6">
          {lifeStoryBlock}
          <div className="space-y-4">
            <p className={editorialEyebrow}>Human Story</p>
            <p className="text-lg leading-8 text-[var(--color-text)]">{layer.story}</p>
          </div>
        </div>
      );
    case "bigIdea":
      return (
        <div className="space-y-6">
          {lifeStoryBlock}
          <div className="space-y-4">
            <p className={editorialEyebrow}>Big Idea</p>
            <h3 className="text-3xl font-extrabold tracking-tight">
              {layer.bigIdea.title}
            </h3>
            <p className={`text-lg leading-8 ${mutedText}`}>
              {layer.bigIdea.explanation}
            </p>
          </div>
        </div>
      );
    case "thinkingTool":
      return (
        <div className="space-y-6">
          {lifeStoryBlock}
          <div className="space-y-4">
            <p className={editorialEyebrow}>Thinking Tool</p>
            <h3 className="text-3xl font-extrabold tracking-tight">
              {layer.thinkingTool.name}
            </h3>
            <p className={`text-lg leading-8 ${mutedText}`}>
              {layer.thinkingTool.instruction}
            </p>
          </div>
        </div>
      );
    case "modernTest":
      return (
        <div className="space-y-6">
          {lifeStoryBlock}
          <div className="space-y-5">
            <p className={editorialEyebrow}>Modern Test</p>
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
                      ? "border-[var(--color-accent)] bg-yellow-400/10"
                      : "border-white/10 bg-white/[0.04] hover:border-[var(--color-accent)]"
                  }`}
                >
                  <span className="block font-medium">{option.label}</span>
                  {state.selectedOption === option.id && (
                    <span className={`mt-2 block text-sm ${mutedText}`}>
                      {option.explanation}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className={`text-sm ${mutedText}`}>
              {layer.modernTest.discussionNotes}
            </p>
          </div>
        </div>
      );
    case "reflection":
      return (
        <div className="space-y-6">
          {lifeStoryBlock}
          <div className="space-y-4">
            <p className={editorialEyebrow}>Reflection Challenge</p>
            <p className="text-lg leading-8">{layer.reflectionPrompt}</p>
            <textarea
              value={state.reflection}
              onChange={(event) => state.setReflection(event.target.value)}
              rows={6}
              className="w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
              placeholder="Write your response here..."
            />
          </div>
        </div>
      );
    case "thoughtTension":
      return (
        <div className="space-y-6">
          {lifeStoryBlock}
          <div className="space-y-4">
            <p className={editorialEyebrow}>Thought Tension</p>
            <p className="font-serif text-2xl leading-snug">{layer.thoughtTension.counterView}</p>
            <p className="text-lg leading-8">{layer.thoughtTension.responsePrompt}</p>
            <textarea
              value={state.tensionResponse}
              onChange={(event) => state.setTensionResponse(event.target.value)}
              rows={6}
              className="w-full rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
              placeholder="Respond to the counter-view..."
            />
          </div>
        </div>
      );
    case "reward":
      return (
        <div className="space-y-6">
          {lifeStoryBlock}
          <div className="space-y-4">
            <p className={editorialEyebrow}>Reward</p>
            <h3 className="text-3xl font-extrabold tracking-tight">
              {state.completed ? "Lesson complete" : "Ready for your reward"}
            </h3>
            <p className={`text-lg ${mutedText}`}>
              You practiced thinking with {state.thinkerName}.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
                <p className={`text-sm ${mutedText}`}>XP</p>
                <p className="text-3xl font-extrabold text-[var(--color-accent)]">
                  +{layer.rewards.xp + 15}
                </p>
              </div>
              {layer.rewards.badge && (
                <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
                  <p className={`text-sm ${mutedText}`}>Badge</p>
                  <p className="text-lg font-semibold capitalize">
                    {layer.rewards.badge.replace(/-/g, " ")}
                  </p>
                </div>
              )}
              <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
                <p className={`text-sm ${mutedText}`}>Skills</p>
                <p className="text-lg font-semibold">
                  {layer.rewards.skills.map((skill) => skill.id).join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
  }
}
