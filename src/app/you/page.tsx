"use client";

import {
  EditorialCard,
  EditorialPageHero,
  EditorialPill,
  SectionHeader,
  editorialEyebrow,
  mutedText,
} from "@/components/ui/editorial";
import { StreakFlame } from "@/components/progress/streak-flame";
import { BADGE_DESCRIPTIONS, BADGE_LABELS } from "@/lib/constants/badges";
import { SKILL_LABELS } from "@/lib/constants/skills";
import { getNextStreakTier, getStreakTier } from "@/lib/gamification/engine";
import { useProgressStore } from "@/lib/progress/store";

export default function YouPage() {
  const progress = useProgressStore((state) => state.progress);
  const hydrated = useProgressStore((state) => state.hydrated);

  if (!hydrated) {
    return <p className="text-[var(--color-muted)]">Loading your progress...</p>;
  }

  const streakTier = getStreakTier(progress.streak.current);
  const nextStreakTier = getNextStreakTier(progress.streak.current);
  const daysUntilNextTier = nextStreakTier
    ? Math.max(nextStreakTier.days - progress.streak.current, 0)
    : 0;

  return (
    <div className="space-y-6">
      <EditorialPageHero
        eyebrow="You"
        title="Your Progress"
        description="Streaks, badges, and thinking skills saved on this device."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <EditorialCard>
          <p className={editorialEyebrow}>Current Streak</p>
          <div className="mt-3">
            <StreakFlame streak={progress.streak.current} size="lg" />
          </div>
          <p className={`mt-3 text-sm ${mutedText}`}>
            Longest streak: {progress.streak.longest} day
            {progress.streak.longest === 1 ? "" : "s"}
          </p>
          <p className={`mt-1 text-sm ${mutedText}`}>
            {streakTier
              ? `${streakTier.name} unlocked.`
              : nextStreakTier
                ? `${daysUntilNextTier} more day${daysUntilNextTier === 1 ? "" : "s"} to unlock ${nextStreakTier.name}.`
                : "Every daily open keeps the flame alive."}
          </p>
        </EditorialCard>
        <EditorialCard>
          <p className={editorialEyebrow}>Lessons Completed</p>
          <p className="mt-3 text-5xl font-extrabold leading-none text-[var(--color-accent)]">
            {progress.completedLessons.length}
          </p>
        </EditorialCard>
      </div>

      <EditorialCard>
        <SectionHeader eyebrow="Growth" title="Mind Skills" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(progress.skillLevels).map(([skill, level]) => (
            <div
              key={skill}
              className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <span>{SKILL_LABELS[skill as keyof typeof SKILL_LABELS]}</span>
              <span className="text-[var(--color-accent)]">Level {level}</span>
            </div>
          ))}
        </div>
      </EditorialCard>

      <EditorialCard>
        <SectionHeader eyebrow="Milestones" title="Badges" />
        {progress.badges.length === 0 ? (
          <p className={`mt-3 ${mutedText}`}>
            Complete lessons to earn your first badge.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {progress.badges.map((badge) => (
              <div
                key={badge}
                className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4"
              >
                <EditorialPill active>{BADGE_LABELS[badge]}</EditorialPill>
                <p className={`mt-3 text-sm leading-6 ${mutedText}`}>
                  {BADGE_DESCRIPTIONS[badge]}
                </p>
              </div>
            ))}
          </div>
        )}
      </EditorialCard>
    </div>
  );
}
