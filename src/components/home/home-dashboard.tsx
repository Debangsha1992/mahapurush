"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotatingThinkerImage } from "@/components/ui/rotating-thinker-image";
import { SKILL_LABELS } from "@/lib/constants/skills";
import type { DailySpark, LearningPath, Thinker } from "@/lib/content/schemas";
import { getPathProgress } from "@/lib/gamification/engine";
import { useProgressStore } from "@/lib/progress/store";

type HomeDashboardProps = {
  dailySpark: DailySpark;
  thinker?: Thinker;
  paths: LearningPath[];
  lessonCounts: Record<string, number>;
  desktopImages: string[];
  mobileImages: string[];
  galleryCaptions: string[];
};

function ModeTile({
  href,
  eyebrow,
  title,
  description,
  action,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition hover:border-[var(--color-accent)]">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
        <p className="mt-3 text-[var(--color-muted)]">{description}</p>
        <span className="mt-5 inline-block text-sm font-medium text-[var(--color-accent)]">
          {action}
        </span>
      </Card>
    </Link>
  );
}

export function HomeDashboard({
  dailySpark,
  thinker,
  paths,
  lessonCounts,
  desktopImages,
  mobileImages,
  galleryCaptions,
}: HomeDashboardProps) {
  const progress = useProgressStore((state) => state.progress);
  const hydrated = useProgressStore((state) => state.hydrated);
  const selectedPath =
    paths.find((path) => path.id === progress.selectedPathId) ?? paths[0];

  if (!hydrated) {
    return <p className="text-[var(--color-muted)]">Loading your progress...</p>;
  }

  const dailyLessonHref = `/thinkers/${thinker?.slug ?? "socrates"}/lessons/${dailySpark.lessonId}`;
  const introspectionHref = progress.onboardingComplete
    ? dailyLessonHref
    : "/introspection";
  const modeTiles = (
    <div className="grid gap-4 md:grid-cols-2">
      <ModeTile
        href="/facts"
        eyebrow="Quick discovery"
        title="Facts"
        description="Meet notable contributors through short, source-backed facts from history and the present."
        action="Explore random facts"
      />
      <ModeTile
        href={introspectionHref}
        eyebrow="Personal journey"
        title="Introspection"
        description="Reflect on what these highlighted lives can teach you about courage, focus, justice, and purpose."
        action={
          progress.onboardingComplete
            ? "Continue introspection"
            : "Begin introspection"
        }
      />
    </div>
  );

  if (!progress.onboardingComplete) {
    return (
      <div className="space-y-6">
        {modeTiles}
        <Card className="space-y-4">
          <h2 className="text-2xl font-semibold">Welcome to MindSpark</h2>
          <p className="text-[var(--color-muted)]">
            Start with quick Facts, or begin Introspection to find your first
            learning path.
          </p>
        </Card>
      </div>
    );
  }

  const topSkills = Object.entries(progress.skillLevels)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const pathProgress = selectedPath
    ? getPathProgress(
        progress,
        selectedPath.thinkerIds,
        (thinkerId) =>
          progress.completedLessons.filter((lessonId) =>
            lessonId.startsWith(`${thinkerId}-`),
          ).length,
        (thinkerId) => lessonCounts[thinkerId] ?? 0,
      )
    : 0;

  const latestJournal = progress.journalEntries[0];

  return (
    <div className="space-y-6">
      {modeTiles}

      <Card className="space-y-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {thinker && (
            <RotatingThinkerImage
              slug={thinker.slug}
              name={thinker.name}
              desktopImages={desktopImages}
              mobileImages={mobileImages}
              captions={galleryCaptions}
              layout="portrait"
              size={240}
              priority
            />
          )}
          <div className="flex-1">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
              Today&apos;s Spark
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight">{dailySpark.question}</h2>
            <p className="mt-3 text-[var(--color-muted)]">
              Think with {thinker?.name ?? "a great mind"} · {dailySpark.estimatedMinutes} min
            </p>
            <Link
              href={dailyLessonHref}
              className="mt-5 inline-block"
            >
              <Button>Continue Introspection</Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Your Mind Skills</h3>
          <div className="mt-4 space-y-3">
            {topSkills.map(([skill, level]) => (
              <div key={skill} className="flex items-center justify-between gap-4">
                <span>{SKILL_LABELS[skill as keyof typeof SKILL_LABELS]}</span>
                <span className="text-[var(--color-accent)]">Level {level}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Continue Journey</h3>
          <p className="mt-2 text-[var(--color-muted)]">
            {selectedPath?.title ?? "The Questioner's Path"}
          </p>
          <p className="mt-4 text-3xl font-semibold text-[var(--color-accent)]">
            {pathProgress}%
          </p>
          {selectedPath && (
            <Link href={`/paths/${selectedPath.slug}`} className="mt-4 inline-block">
              <Button variant="secondary">View Path</Button>
            </Link>
          )}
        </Card>
      </div>

      {latestJournal && (
        <Card>
          <h3 className="text-lg font-semibold">Saved Thought</h3>
          <p className="mt-3 font-serif text-xl leading-relaxed">
            &ldquo;{latestJournal.response.slice(0, 140)}
            {latestJournal.response.length > 140 ? "..." : ""}&rdquo;
          </p>
          <Link href="/journal" className="mt-4 inline-block text-sm text-[var(--color-accent)]">
            Open journal
          </Link>
        </Card>
      )}
    </div>
  );
}
