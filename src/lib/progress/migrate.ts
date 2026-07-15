import type { Progress } from "@/lib/content/schemas";
import { progressSchema, progressV1Schema } from "@/lib/content/schemas";
import { checkEarnedBadges, createInitialProgress } from "@/lib/gamification/engine";

function stripLegacyXp(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  const { xp: _legacyXp, ...rest } = value as Record<string, unknown>;
  return rest;
}

export function migrateProgress(value: unknown): Progress {
  const withoutXp = stripLegacyXp(value);
  const current = progressSchema.safeParse(withoutXp);
  if (current.success) {
    const progress = current.data;
    return {
      ...progress,
      badges: checkEarnedBadges(progress),
    };
  }

  const legacy = progressV1Schema.safeParse(withoutXp);
  if (legacy.success) {
    const initial = createInitialProgress();
    const legacyProgress = legacy.data;
    const migrated: Progress = {
      ...initial,
      ...legacyProgress,
      version: 2,
      dailyActivity: {
        lastOpenedDate: legacyProgress.streak.lastActiveDate,
        openedDates: legacyProgress.streak.lastActiveDate
          ? [legacyProgress.streak.lastActiveDate]
          : [],
        lessonCompletionsByDate: {},
      },
      session: initial.session,
    };

    return {
      ...migrated,
      badges: checkEarnedBadges(migrated),
    };
  }

  return createInitialProgress();
}
