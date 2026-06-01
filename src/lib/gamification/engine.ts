import type { BadgeId } from "@/lib/constants/badges";
import type { SkillId } from "@/lib/constants/skills";
import { SKILLS } from "@/lib/constants/skills";
import type { LessonLayer, Progress } from "@/lib/content/schemas";

export function createInitialProgress(): Progress {
  const skillLevels = Object.fromEntries(
    SKILLS.map((skill) => [skill, 0]),
  ) as Record<SkillId, number>;

  return {
    version: 1,
    onboardingComplete: false,
    selectedPathId: null,
    xp: 0,
    streak: {
      current: 0,
      longest: 0,
      lastActiveDate: null,
    },
    completedLessons: [],
    lessonSteps: {},
    skillLevels,
    badges: [],
    journalEntries: [],
    savedQuotes: [],
    completedWeeklyChallenges: [],
  };
}

export function calculateLessonXp(input: {
  baseXp: number;
  reflectionSubmitted: boolean;
  thoughtTensionSubmitted: boolean;
}): number {
  let xp = input.baseXp;
  if (input.reflectionSubmitted) {
    xp += 10;
  }
  if (input.thoughtTensionSubmitted) {
    xp += 5;
  }
  return xp;
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

  return [...earned];
}

export function completeLesson(
  progress: Progress,
  lessonId: string,
  layer: LessonLayer,
  activityDate: string,
): Progress {
  if (progress.completedLessons.includes(lessonId)) {
    return progress;
  }

  const xpGain = calculateLessonXp({
    baseXp: layer.rewards.xp,
    reflectionSubmitted: true,
    thoughtTensionSubmitted: true,
  });

  const nextProgress: Progress = {
    ...progress,
    xp: progress.xp + xpGain,
    completedLessons: [...progress.completedLessons, lessonId],
    skillLevels: updateSkillLevels(progress.skillLevels, layer.rewards.skills),
    streak: updateStreak(progress.streak, activityDate),
    badges: [...progress.badges],
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
  return date.toISOString().slice(0, 10);
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
