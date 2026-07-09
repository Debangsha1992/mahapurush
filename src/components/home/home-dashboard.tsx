"use client";

import { BookOpen, Compass, Telescope } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MinimalistHero } from "@/components/ui/minimalist-hero";
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

const editorialPanel =
  "border-white/10 bg-[#0b0b0f] shadow-none ring-1 ring-white/5";
const editorialEyebrow =
  "text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]";
const mutedText = "text-[var(--color-muted)]";

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
    <Link href={href} className="group block focus:outline-none">
      <Card
        className={`relative h-full overflow-hidden p-7 transition focus-within:border-[var(--color-accent)] group-hover:border-[var(--color-accent)] ${editorialPanel}`}
      >
        <div className="absolute -right-14 -top-14 size-32 rounded-full bg-yellow-400/10 transition group-hover:bg-yellow-400/20" />
        <p className={editorialEyebrow}>{eyebrow}</p>
        <h2 className="mt-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl">
          {title}
        </h2>
        <p className={`mt-4 max-w-md leading-7 ${mutedText}`}>{description}</p>
        <span className="mt-7 inline-block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
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
  const hero = (
    <MinimalistHero
      logoText="MindSpark"
      navLinks={[
        { label: "FACTS", href: "/facts" },
        { label: "PEOPLE", href: "/people" },
        { label: "PATHS", href: "/paths" },
        { label: "JOURNAL", href: "/journal" },
      ]}
      mainText="Practice sharper thinking with Galileo and other world-changing minds through short discoveries, reflection, and guided lessons."
      readMoreLink="#home-dashboard"
      imageSrc="/assets/hero/galileo-black-white-cutout.png"
      imageAlt="Black and white figure of Galileo Galilei"
      overlayText={{
        part1: "think",
        part2: "deeper.",
      }}
      socialLinks={[
        { icon: Telescope, href: "/explore" },
        { icon: BookOpen, href: "/facts" },
        { icon: Compass, href: "/paths" },
      ]}
      locationText="Florence, 1633"
    />
  );
  const progress = useProgressStore((state) => state.progress);
  const hydrated = useProgressStore((state) => state.hydrated);
  const selectedPath =
    paths.find((path) => path.id === progress.selectedPathId) ?? paths[0];

  if (!hydrated) {
    return (
      <div>
        {hero}
        <section
          id="home-dashboard"
          className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
        >
          <p className={mutedText}>Loading your progress...</p>
        </section>
      </div>
    );
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
      <div>
        {hero}
        <section
          id="home-dashboard"
          className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
        >
          <div className="space-y-6">
            {modeTiles}
            <Card className={`space-y-5 p-8 ${editorialPanel}`}>
              <p className={editorialEyebrow}>Start here</p>
              <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl">
                Welcome to MindSpark
              </h2>
              <p className={`max-w-2xl text-lg leading-8 ${mutedText}`}>
                Start with quick Facts, or begin Introspection to find your first
                learning path.
              </p>
            </Card>
          </div>
        </section>
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
    <div>
      {hero}
      <section
        id="home-dashboard"
        className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6"
      >
        <div className="space-y-6">
          {modeTiles}

          <Card className={`relative overflow-hidden p-8 ${editorialPanel}`}>
            <div className="absolute -right-20 -top-20 size-52 rounded-full bg-yellow-400/10" />
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
                <p className={editorialEyebrow}>
                  Today&apos;s Spark
                </p>
                <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                  {dailySpark.question}
                </h2>
                <p className={`mt-4 ${mutedText}`}>
                  Think with {thinker?.name ?? "a great mind"} ·{" "}
                  {dailySpark.estimatedMinutes} min
                </p>
                <Link href={dailyLessonHref} className="mt-5 inline-block">
                  <Button>Continue Introspection</Button>
                </Link>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className={`p-7 ${editorialPanel}`}>
              <p className={editorialEyebrow}>Growth</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight">
                Your Mind Skills
              </h3>
              <div className="mt-4 space-y-3">
                {topSkills.map(([skill, level]) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between gap-4 border-t border-white/10 pt-3"
                  >
                    <span>{SKILL_LABELS[skill as keyof typeof SKILL_LABELS]}</span>
                    <span className="font-semibold text-[var(--color-accent)]">
                      Level {level}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={`p-7 ${editorialPanel}`}>
              <p className={editorialEyebrow}>Path</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight">
                Continue Journey
              </h3>
              <p className={`mt-3 ${mutedText}`}>
                {selectedPath?.title ?? "The Questioner's Path"}
              </p>
              <p className="mt-5 text-6xl font-extrabold leading-none text-[var(--color-accent)]">
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
            <Card className={`p-8 ${editorialPanel}`}>
              <p className={editorialEyebrow}>Reflection</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight">
                Saved Thought
              </h3>
              <p className="mt-5 font-serif text-2xl leading-relaxed">
                &ldquo;{latestJournal.response.slice(0, 140)}
                {latestJournal.response.length > 140 ? "..." : ""}&rdquo;
              </p>
              <Link
                href="/journal"
                className="mt-4 inline-block text-sm text-[var(--color-accent)]"
              >
                Open journal
              </Link>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
