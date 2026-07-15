export const BADGES = [
  "questioner",
  "justice-seeker",
  "imagination-engineer",
  "calm-observer",
  "logic-master",
  "creative-mind",
  "courage-builder",
  "streak-5",
  "streak-50",
  "streak-100",
  "streak-200",
  "streak-500",
  "streak-1000",
  "two-lesson-session",
  "daily-double-lesson-streak",
] as const;

export type BadgeId = (typeof BADGES)[number];

export const BADGE_LABELS: Record<BadgeId, string> = {
  questioner: "The Questioner",
  "justice-seeker": "Justice Seeker",
  "imagination-engineer": "Imagination Engineer",
  "calm-observer": "Calm Observer",
  "logic-master": "Logic Master",
  "creative-mind": "Creative Mind",
  "courage-builder": "Courage Builder",
  "streak-5": "Ember Flame",
  "streak-50": "Blue Flame",
  "streak-100": "Violet Flame",
  "streak-200": "Verdant Flame",
  "streak-500": "Rose Flame",
  "streak-1000": "Aurora Flame",
  "two-lesson-session": "Two-Lesson Spark",
  "daily-double-lesson-streak": "Daily Deep Practice",
};

export const BADGE_DESCRIPTIONS: Record<BadgeId, string> = {
  questioner: "Reached a questioning skill milestone.",
  "justice-seeker": "Reached a justice skill milestone.",
  "imagination-engineer": "Reached an imagination skill milestone.",
  "calm-observer": "Reached a self-awareness skill milestone.",
  "logic-master": "Reached a logic skill milestone.",
  "creative-mind": "Reached a creativity skill milestone.",
  "courage-builder": "Reached a courage skill milestone.",
  "streak-5": "Opened MindSpark for 5 days in a row.",
  "streak-50": "Opened MindSpark for 50 days in a row.",
  "streak-100": "Opened MindSpark for 100 days in a row.",
  "streak-200": "Opened MindSpark for 200 days in a row.",
  "streak-500": "Opened MindSpark for 500 days in a row.",
  "streak-1000": "Opened MindSpark for 1000 days in a row.",
  "two-lesson-session": "Completed two lessons in one app session.",
  "daily-double-lesson-streak":
    "Completed two lessons on each day of a 5-day streak.",
};
