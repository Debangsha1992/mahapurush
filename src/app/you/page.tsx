"use client";

import { Card } from "@/components/ui/card";
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
      <div>
        <h2 className="text-3xl font-semibold">Your Progress</h2>
        <p className="mt-2 text-[var(--color-muted)]">
          XP, streaks, badges, and thinking skills saved on this device.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-[var(--color-muted)]">XP</p>
          <p className="mt-2 text-3xl font-semibold">{progress.xp}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Current Streak</p>
          <p className="mt-2 text-3xl font-semibold">{progress.streak.current} days</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-muted)]">Lessons Completed</p>
          <p className="mt-2 text-3xl font-semibold">
            {progress.completedLessons.length}
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-semibold">Mind Skills</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(progress.skillLevels).map(([skill, level]) => (
            <div
              key={skill}
              className="flex items-center justify-between rounded-[1rem] bg-[var(--color-surface-raised)] px-4 py-3"
            >
              <span>{SKILL_LABELS[skill as keyof typeof SKILL_LABELS]}</span>
              <span className="text-[var(--color-accent)]">Level {level}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold">Badges</h3>
        {progress.badges.length === 0 ? (
          <p className="mt-3 text-[var(--color-muted)]">
            Complete lessons to earn your first badge.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {progress.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm text-[#101014]"
              >
                {BADGE_LABELS[badge]}
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
