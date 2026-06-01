export const BADGES = [
  "questioner",
  "justice-seeker",
  "imagination-engineer",
  "calm-observer",
  "logic-master",
  "creative-mind",
  "courage-builder",
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
};
