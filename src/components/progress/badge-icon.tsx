"use client";

import {
  BookOpenCheck,
  Brain,
  Compass,
  Eye,
  Lightbulb,
  MessageCircleQuestion,
  Scale,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { BadgeId } from "@/lib/constants/badges";
import { STREAK_TIERS } from "@/lib/constants/rewards";
import { cn } from "@/lib/utils";
import { AnimatedFlame } from "@/components/progress/animated-flame";

const BADGE_ICON_MAP: Partial<Record<BadgeId, LucideIcon>> = {
  questioner: MessageCircleQuestion,
  "justice-seeker": Scale,
  "imagination-engineer": Lightbulb,
  "calm-observer": Eye,
  "logic-master": Brain,
  "creative-mind": Sparkles,
  "courage-builder": Shield,
  "two-lesson-session": BookOpenCheck,
  "daily-double-lesson-streak": Compass,
};

const STREAK_BADGE_DAYS = Object.fromEntries(
  STREAK_TIERS.map((tier) => [tier.badgeId, tier.days]),
) as Partial<Record<BadgeId, number>>;

type BadgeIconProps = {
  badge: BadgeId;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-8",
  md: "size-11",
  lg: "size-14",
} as const;

const iconSizes = {
  sm: 16,
  md: 22,
  lg: 28,
} as const;

export function BadgeIcon({ badge, size = "md", className }: BadgeIconProps) {
  const reduceMotion = useReducedMotion();
  const streakDays = STREAK_BADGE_DAYS[badge];
  const Icon = BADGE_ICON_MAP[badge];
  const streakTier = STREAK_TIERS.find((tier) => tier.badgeId === badge);
  const accent = streakTier?.color ?? "var(--color-accent)";

  return (
    <motion.span
      className={cn(
        "inline-flex items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.05]",
        sizeClasses[size],
        className,
      )}
      style={{
        color: accent,
        boxShadow: streakTier ? `0 0 18px ${streakTier.glow}` : undefined,
      }}
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -2, 0],
              scale: [1, 1.04, 1],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {typeof streakDays === "number" ? (
        <AnimatedFlame streak={streakDays} size={size === "lg" ? "md" : "sm"} />
      ) : (
        Icon && <Icon size={iconSizes[size]} strokeWidth={2.1} />
      )}
    </motion.span>
  );
}
