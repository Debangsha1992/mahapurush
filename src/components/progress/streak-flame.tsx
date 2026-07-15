"use client";

import { cn } from "@/lib/utils";
import {
  getFlameStyle,
  getNextFlameMilestone,
  getNextStreakTier,
  getStreakTier,
} from "@/lib/gamification/engine";
import { AnimatedFlame } from "@/components/progress/animated-flame";

const sizeClasses = {
  sm: {
    wrapper: "gap-2 rounded-full px-3 py-1.5",
    count: "text-xs",
    label: "text-[0.62rem]",
  },
  md: {
    wrapper: "gap-3 rounded-[1rem] px-4 py-3",
    count: "text-sm",
    label: "text-xs",
  },
  lg: {
    wrapper: "gap-4 rounded-[1.25rem] px-5 py-4",
    count: "text-base",
    label: "text-xs",
  },
};

type StreakFlameProps = {
  streak: number;
  size?: keyof typeof sizeClasses;
  showLabel?: boolean;
  className?: string;
};

export function StreakFlame({
  streak,
  size = "md",
  showLabel = true,
  className,
}: StreakFlameProps) {
  const flame = getFlameStyle(streak);
  const badgeTier = getStreakTier(streak);
  const nextBadgeTier = getNextStreakTier(streak);
  const nextFlameMilestone = getNextFlameMilestone(streak);
  const classes = sizeClasses[size];
  const daysUntilFlameColor = Math.max(nextFlameMilestone - streak, 0);

  return (
    <div
      className={cn(
        "inline-flex items-center border border-white/10 bg-white/[0.04]",
        classes.wrapper,
        className,
      )}
    >
      <AnimatedFlame streak={streak} size={size} />
      {showLabel && (
        <span>
          <span className={cn("block font-extrabold leading-none", classes.count)}>
            {streak} day{streak === 1 ? "" : "s"}
          </span>
          <span
            className={cn(
              "mt-1 block uppercase tracking-[0.16em] text-[var(--color-muted)]",
              classes.label,
            )}
            style={flame.active && streak >= 10 ? { color: flame.color } : undefined}
          >
            {streak >= 10
              ? `${flame.name} · ${flame.milestoneDays}+`
              : badgeTier
                ? badgeTier.name
                : daysUntilFlameColor > 0
                  ? `${daysUntilFlameColor} to next color`
                  : nextBadgeTier
                    ? `${nextBadgeTier.days - streak} to flame badge`
                    : "Legend streak"}
          </span>
        </span>
      )}
    </div>
  );
}
