import type { BadgeId } from "@/lib/constants/badges";

export const FLAME_COLOR_STEP_DAYS = 10;

/** Visual flame colors that advance every 10 streak days. */
export const FLAME_COLORS = [
  {
    name: "Ember",
    color: "#f97316",
    secondary: "#fb923c",
    glow: "rgba(249, 115, 22, 0.5)",
  },
  {
    name: "Amber",
    color: "#f59e0b",
    secondary: "#fbbf24",
    glow: "rgba(245, 158, 11, 0.5)",
  },
  {
    name: "Gold",
    color: "#eab308",
    secondary: "#facc15",
    glow: "rgba(234, 179, 8, 0.48)",
  },
  {
    name: "Crimson",
    color: "#ef4444",
    secondary: "#f87171",
    glow: "rgba(239, 68, 68, 0.48)",
  },
  {
    name: "Azure",
    color: "#38bdf8",
    secondary: "#7dd3fc",
    glow: "rgba(56, 189, 248, 0.5)",
  },
  {
    name: "Indigo",
    color: "#818cf8",
    secondary: "#a5b4fc",
    glow: "rgba(129, 140, 248, 0.48)",
  },
  {
    name: "Violet",
    color: "#a78bfa",
    secondary: "#c4b5fd",
    glow: "rgba(167, 139, 250, 0.48)",
  },
  {
    name: "Fuchsia",
    color: "#e879f9",
    secondary: "#f0abfc",
    glow: "rgba(232, 121, 249, 0.45)",
  },
  {
    name: "Rose",
    color: "#fb7185",
    secondary: "#fda4af",
    glow: "rgba(251, 113, 133, 0.48)",
  },
  {
    name: "Verdant",
    color: "#34d399",
    secondary: "#6ee7b7",
    glow: "rgba(52, 211, 153, 0.45)",
  },
] as const;

export const STARTER_FLAME = {
  name: "Spark",
  color: "#c4a484",
  secondary: "#d6b896",
  glow: "rgba(196, 164, 132, 0.28)",
} as const;

export const STREAK_TIERS = [
  {
    days: 5,
    badgeId: "streak-5",
    name: "Ember Flame",
    color: "#f97316",
    glow: "rgba(249, 115, 22, 0.45)",
  },
  {
    days: 50,
    badgeId: "streak-50",
    name: "Blue Flame",
    color: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.45)",
  },
  {
    days: 100,
    badgeId: "streak-100",
    name: "Violet Flame",
    color: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.45)",
  },
  {
    days: 200,
    badgeId: "streak-200",
    name: "Verdant Flame",
    color: "#4ade80",
    glow: "rgba(74, 222, 128, 0.4)",
  },
  {
    days: 500,
    badgeId: "streak-500",
    name: "Rose Flame",
    color: "#fb7185",
    glow: "rgba(251, 113, 133, 0.42)",
  },
  {
    days: 1000,
    badgeId: "streak-1000",
    name: "Aurora Flame",
    color: "#fef3c7",
    glow: "rgba(254, 243, 199, 0.5)",
  },
] as const satisfies readonly {
  days: number;
  badgeId: BadgeId;
  name: string;
  color: string;
  glow: string;
}[];

export const TWO_LESSON_SESSION_BADGE = "two-lesson-session" satisfies BadgeId;
export const DAILY_DOUBLE_LESSON_STREAK_BADGE =
  "daily-double-lesson-streak" satisfies BadgeId;

export const DAILY_DOUBLE_LESSON_STREAK_DAYS = 5;
