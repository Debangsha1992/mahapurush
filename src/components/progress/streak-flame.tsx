"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getNextStreakTier, getStreakTier } from "@/lib/gamification/engine";

const sizeClasses = {
  sm: {
    wrapper: "gap-2 rounded-full px-3 py-1.5",
    flame: "text-xl",
    count: "text-xs",
    label: "text-[0.62rem]",
  },
  md: {
    wrapper: "gap-3 rounded-[1rem] px-4 py-3",
    flame: "text-4xl",
    count: "text-sm",
    label: "text-xs",
  },
  lg: {
    wrapper: "gap-4 rounded-[1.25rem] px-5 py-4",
    flame: "text-6xl",
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
  const reduceMotion = useReducedMotion();
  const tier = getStreakTier(streak);
  const nextTier = getNextStreakTier(streak);
  const classes = sizeClasses[size];
  const daysUntilNext = nextTier ? Math.max(nextTier.days - streak, 0) : 0;

  return (
    <div
      className={cn(
        "inline-flex items-center border border-white/10 bg-white/[0.04]",
        classes.wrapper,
        className,
      )}
    >
      <motion.span
        aria-hidden="true"
        className={cn("block leading-none", classes.flame)}
        animate={
          tier && !reduceMotion
            ? {
                scale: [1, 1.08, 0.98, 1.04, 1],
                rotate: [-2, 2, -1, 1, -2],
              }
            : { scale: 1, rotate: 0 }
        }
        transition={
          tier && !reduceMotion
            ? { duration: 1.45, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        style={{
          filter: tier?.filter ?? "grayscale(1) opacity(0.55)",
          textShadow: tier ? `0 0 24px ${tier.glow}` : undefined,
        }}
      >
        🔥
      </motion.span>
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
          >
            {tier
              ? tier.name
              : nextTier
                ? `${daysUntilNext} to flame`
                : "Legend streak"}
          </span>
        </span>
      )}
    </div>
  );
}
