"use client";

import {
  EditorialCard,
  EditorialPageHero,
  EditorialPill,
  SectionHeader,
  editorialEyebrow,
  mutedText,
} from "@/components/ui/editorial";
import { BADGE_LABELS } from "@/lib/constants/badges";
import { SKILL_LABELS } from "@/lib/constants/skills";
import { useProgressStore } from "@/lib/progress/store";

export default function YouPage() {
  const progress = useProgressStore((state) => state.progress);
  const hydrated = useProgressStore((state) => state.hydrated);

  if (!hydrated) {
    return <p className="text-[var(--color-muted)]">Loading your progress...</p>;
  }

  return (
    <div className="space-y-6">
      <EditorialPageHero
        eyebrow="You"
        title="Your Progress"
        description="XP, streaks, badges, and thinking skills saved on this device."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <EditorialCard>
          <p className={editorialEyebrow}>XP</p>
          <p className="mt-3 text-5xl font-extrabold leading-none text-[var(--color-accent)]">
            {progress.xp}
          </p>
        </EditorialCard>
        <EditorialCard>
          <p className={editorialEyebrow}>Current Streak</p>
          <p className="mt-3 text-5xl font-extrabold leading-none text-[var(--color-accent)]">
            {progress.streak.current}
          </p>
          <p className={`mt-2 text-sm ${mutedText}`}>days</p>
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
          <div className="mt-4 flex flex-wrap gap-2">
            {progress.badges.map((badge) => (
              <EditorialPill key={badge} active>
                {BADGE_LABELS[badge]}
              </EditorialPill>
            ))}
          </div>
        )}
      </EditorialCard>
    </div>
  );
}
