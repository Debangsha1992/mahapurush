import type { BadgeId } from "@/lib/constants/badges";

export const STREAK_TIERS = [
  {
    days: 5,
    badgeId: "streak-5",
    name: "Ember Flame",
    color: "#f97316",
    glow: "rgba(249, 115, 22, 0.45)",
    filter: "none",
  },
  {
    days: 50,
    badgeId: "streak-50",
    name: "Blue Flame",
    color: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.45)",
    filter: "hue-rotate(175deg) saturate(1.45)",
  },
  {
    days: 100,
    badgeId: "streak-100",
    name: "Violet Flame",
    color: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.45)",
    filter: "hue-rotate(245deg) saturate(1.35)",
  },
  {
    days: 200,
    badgeId: "streak-200",
    name: "Verdant Flame",
    color: "#4ade80",
    glow: "rgba(74, 222, 128, 0.4)",
    filter: "hue-rotate(95deg) saturate(1.45)",
  },
  {
    days: 500,
    badgeId: "streak-500",
    name: "Rose Flame",
    color: "#fb7185",
    glow: "rgba(251, 113, 133, 0.42)",
    filter: "hue-rotate(315deg) saturate(1.4)",
  },
  {
    days: 1000,
    badgeId: "streak-1000",
    name: "Aurora Flame",
    color: "#fef3c7",
    glow: "rgba(254, 243, 199, 0.5)",
    filter: "brightness(1.2) saturate(0.85)",
  },
] as const satisfies readonly {
  days: number;
  badgeId: BadgeId;
  name: string;
  color: string;
  glow: string;
  filter: string;
}[];

export const TWO_LESSON_SESSION_BADGE = "two-lesson-session" satisfies BadgeId;
export const DAILY_DOUBLE_LESSON_STREAK_BADGE =
  "daily-double-lesson-streak" satisfies BadgeId;

export const DAILY_DOUBLE_LESSON_STREAK_DAYS = 5;
