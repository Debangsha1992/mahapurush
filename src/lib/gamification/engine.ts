import type { BadgeId } from "@/lib/constants/badges";
import {
  DAILY_DOUBLE_LESSON_STREAK_BADGE,
  DAILY_DOUBLE_LESSON_STREAK_DAYS,
  STREAK_TIERS,
  TWO_LESSON_SESSION_BADGE,
} from "@/lib/constants/rewards";
import type { SkillId } from "@/lib/constants/skills";
import { SKILLS } from "@/lib/constants/skills";
import type { LessonLayer, Progress } from "@/lib/content/schemas";

export function createInitialProgress(): Progress {
  const skillLevels = Object.fromEntries(
    SKILLS.map((skill) => [skill, 0]),
  ) as Record<SkillId, number>;

  return {
    version: 2,
    onboardingComplete: false,
    selectedPathId: null,
    streak: {
      current: 0,
      longest: 0,
      lastActiveDate: null,
    },
    completedLessons: [],
    lessonSteps: {},
    skillLevels,
    badges: [],
    dailyActivity: {
      lastOpenedDate: null,
      openedDates: [],
      lessonCompletionsByDate: {},
    },
    session: {
      currentSessionId: null,
      startedAt: null,
      completedLessonIds: [],
    },
    journalEntries: [],
    savedQuotes: [],
    completedWeeklyChallenges: [],
  };
}

function uniqueAppend(values: string[], value: string): string[] {
  if (values.includes(value)) {
    return values;
  }
  return [...values, value];
}

export function updateSkillLevels(
  current: Record<SkillId, number>,
  rewards: LessonLayer["rewards"]["skills"],
): Record<SkillId, number> {
  const next = { ...current };
  for (const reward of rewards) {
    next[reward.id] = (next[reward.id] ?? 0) + reward.points;
  }
  return next;
}

export function updateStreak(
  streak: Progress["streak"],
  activityDate: string,
): Progress["streak"] {
  if (streak.lastActiveDate === activityDate) {
    return streak;
  }

  if (!streak.lastActiveDate) {
    return {
      current: 1,
      longest: Math.max(streak.longest, 1),
      lastActiveDate: activityDate,
    };
  }

  const previous = new Date(`${streak.lastActiveDate}T00:00:00.000Z`);
  const current = new Date(`${activityDate}T00:00:00.000Z`);
  const dayDiff = Math.round(
    (current.getTime() - previous.getTime()) / 86_400_000,
  );

  const nextCurrent = dayDiff === 1 ? streak.current + 1 : 1;

  return {
    current: nextCurrent,
    longest: Math.max(streak.longest, nextCurrent),
    lastActiveDate: activityDate,
  };
}

function shiftDateString(dateString: string, dayOffset: number): string {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return date.toISOString().slice(0, 10);
}

export function getStreakTier(streakCount: number) {
  let reachedTier: (typeof STREAK_TIERS)[number] | null = null;

  for (const tier of STREAK_TIERS) {
    if (streakCount >= tier.days) {
      reachedTier = tier;
    }
  }

  return reachedTier;
}

export function getNextStreakTier(streakCount: number) {
  return STREAK_TIERS.find((tier) => streakCount < tier.days) ?? null;
}

export function getCurrentStreakDates(streak: Progress["streak"]): string[] {
  if (!streak.lastActiveDate || streak.current === 0) {
    return [];
  }

  return Array.from({ length: streak.current }, (_, index) =>
    shiftDateString(streak.lastActiveDate!, index - streak.current + 1),
  );
}

export function hasDailyDoubleLessonStreak(progress: Progress): boolean {
  if (progress.streak.current < DAILY_DOUBLE_LESSON_STREAK_DAYS) {
    return false;
  }

  return getCurrentStreakDates(progress.streak).every(
    (date) =>
      (progress.dailyActivity.lessonCompletionsByDate[date]?.length ?? 0) >= 2,
  );
}

export function checkEarnedBadges(progress: Progress): BadgeId[] {
  const earned = new Set(progress.badges);

  if (progress.skillLevels.questioning >= 4) {
    earned.add("questioner");
  }
  if (progress.skillLevels.justice >= 4) {
    earned.add("justice-seeker");
  }
  if (progress.skillLevels.imagination >= 4) {
    earned.add("imagination-engineer");
  }
  if (progress.skillLevels["self-awareness"] >= 4) {
    earned.add("calm-observer");
  }
  if (progress.skillLevels.logic >= 4) {
    earned.add("logic-master");
  }
  if (progress.skillLevels.creativity >= 4) {
    earned.add("creative-mind");
  }
  if (progress.skillLevels.courage >= 4) {
    earned.add("courage-builder");
  }

  for (const tier of STREAK_TIERS) {
    if (progress.streak.current >= tier.days) {
      earned.add(tier.badgeId);
    }
  }

  if (progress.session.completedLessonIds.length >= 2) {
    earned.add(TWO_LESSON_SESSION_BADGE);
  }

  if (hasDailyDoubleLessonStreak(progress)) {
    earned.add(DAILY_DOUBLE_LESSON_STREAK_BADGE);
  }

  return [...earned];
}

export function recordDailyOpen(
  progress: Progress,
  activityDate: string,
  sessionId: string | null = progress.session.currentSessionId,
  sessionStartedAt: string | null = progress.session.startedAt,
): Progress {
  const openedDates = uniqueAppend(
    progress.dailyActivity.openedDates,
    activityDate,
  );
  const openedToday = progress.dailyActivity.lastOpenedDate === activityDate;
  const session =
    sessionId && progress.session.currentSessionId !== sessionId
      ? {
          currentSessionId: sessionId,
          startedAt: sessionStartedAt,
          completedLessonIds: [],
        }
      : progress.session;

  const nextProgress: Progress = {
    ...progress,
    streak: openedToday ? progress.streak : updateStreak(progress.streak, activityDate),
    dailyActivity: {
      ...progress.dailyActivity,
      lastOpenedDate: activityDate,
      openedDates,
    },
    session,
  };

  return {
    ...nextProgress,
    badges: checkEarnedBadges(nextProgress),
  };
}

export function recordSessionLessonCompletion(
  progress: Progress,
  lessonId: string,
  activityDate: string,
  sessionId: string | null = progress.session.currentSessionId,
  sessionStartedAt: string | null = progress.session.startedAt,
): Progress {
  const activeProgress = recordDailyOpen(
    progress,
    activityDate,
    sessionId,
    sessionStartedAt,
  );
  const lessonsForDate =
    activeProgress.dailyActivity.lessonCompletionsByDate[activityDate] ?? [];
  const completedLessonIds = uniqueAppend(
    activeProgress.session.completedLessonIds,
    lessonId,
  );

  const nextProgress: Progress = {
    ...activeProgress,
    dailyActivity: {
      ...activeProgress.dailyActivity,
      lessonCompletionsByDate: {
        ...activeProgress.dailyActivity.lessonCompletionsByDate,
        [activityDate]: uniqueAppend(lessonsForDate, lessonId),
      },
    },
    session: {
      ...activeProgress.session,
      completedLessonIds,
    },
  };

  return {
    ...nextProgress,
    badges: checkEarnedBadges(nextProgress),
  };
}

export function completeLesson(
  progress: Progress,
  lessonId: string,
  layer: LessonLayer,
  activityDate: string,
  sessionId?: string | null,
  sessionStartedAt?: string | null,
): Progress {
  if (progress.completedLessons.includes(lessonId)) {
    return progress;
  }

  const activeProgress = recordSessionLessonCompletion(
    progress,
    lessonId,
    activityDate,
    sessionId,
    sessionStartedAt,
  );

  const nextProgress: Progress = {
    ...activeProgress,
    completedLessons: [...activeProgress.completedLessons, lessonId],
    skillLevels: updateSkillLevels(activeProgress.skillLevels, layer.rewards.skills),
    badges: [...activeProgress.badges],
  };

  if (layer.rewards.badge && !nextProgress.badges.includes(layer.rewards.badge)) {
    nextProgress.badges = [...nextProgress.badges, layer.rewards.badge];
  }

  nextProgress.badges = checkEarnedBadges(nextProgress);
  return nextProgress;
}

export function getPathProgress(
  progress: Progress,
  thinkerIds: string[],
  getCompletedCount: (thinkerId: string) => number,
  getTotalCount: (thinkerId: string) => number,
): number {
  if (thinkerIds.length === 0) {
    return 0;
  }

  const percentages = thinkerIds.map((thinkerId) => {
    const total = getTotalCount(thinkerId);
    if (total === 0) {
      return 0;
    }
    return (getCompletedCount(thinkerId) / total) * 100;
  });

  return Math.round(
    percentages.reduce((sum, value) => sum + value, 0) / percentages.length,
  );
}

export function getTodayDateString(date = new Date()): string {
  return getLocalDateString(date);
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isLessonUnlocked(
  progress: Progress,
  lessonOrder: number,
  thinkerId: string,
  lessons: { id: string; order: number; thinkerId: string }[],
): boolean {
  if (lessonOrder === 1) {
    return true;
  }

  const previousLesson = lessons
    .filter((lesson) => lesson.thinkerId === thinkerId)
    .find((lesson) => lesson.order === lessonOrder - 1);

  if (!previousLesson) {
    return true;
  }

  return progress.completedLessons.includes(previousLesson.id);
}
