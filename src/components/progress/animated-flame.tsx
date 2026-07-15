"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getFlameStyle } from "@/lib/gamification/engine";

const sizeMap = {
  sm: 22,
  md: 36,
  lg: 56,
} as const;

type AnimatedFlameProps = {
  streak: number;
  size?: keyof typeof sizeMap;
  className?: string;
};

export function AnimatedFlame({
  streak,
  size = "md",
  className,
}: AnimatedFlameProps) {
  const reduceMotion = useReducedMotion();
  const flame = getFlameStyle(streak);
  const pixels = sizeMap[size];
  const animate = flame.active && !reduceMotion;

  return (
    <motion.span
      aria-hidden="true"
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{
        width: pixels,
        height: pixels,
        filter: flame.active ? `drop-shadow(0 0 10px ${flame.glow})` : undefined,
      }}
      animate={
        animate
          ? {
              scale: [1, 1.08, 0.96, 1.05, 1],
              y: [0, -1.5, 0.5, -1, 0],
              rotate: [-3, 2, -1.5, 2.5, -3],
            }
          : { scale: 1, y: 0, rotate: 0 }
      }
      transition={
        animate
          ? { duration: 1.35, repeat: Infinity, ease: "easeInOut" }
          : undefined
      }
    >
      <svg
        viewBox="0 0 64 64"
        width={pixels}
        height={pixels}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animate ? "animate-flame-flicker" : undefined}
      >
        <defs>
          <linearGradient
            id={`flame-core-${size}-${flame.milestoneDays}`}
            x1="32"
            y1="8"
            x2="32"
            y2="58"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={flame.secondary} />
            <stop offset="55%" stopColor={flame.color} />
            <stop offset="100%" stopColor="#7c2d12" stopOpacity={flame.active ? 0.9 : 0.35} />
          </linearGradient>
        </defs>
        <path
          d="M32 6C28 16 18 22 16 34c-2 12 8 24 16 24s18-12 16-24C46 22 36 16 32 6Z"
          fill={`url(#flame-core-${size}-${flame.milestoneDays})`}
          opacity={flame.active ? 1 : 0.55}
        />
        <path
          d="M32 24c-2.5 6-8 9-9 16-1 7 4 14 9 14s10-7 9-14c-1-7-6.5-10-9-16Z"
          fill="#fff7ed"
          opacity={flame.active ? 0.9 : 0.35}
        />
        <path
          d="M32 34c-1.4 3.2-4.2 4.8-4.8 8.4-.6 3.6 2 7.2 4.8 7.2s5.4-3.6 4.8-7.2c-.6-3.6-3.4-5.2-4.8-8.4Z"
          fill={flame.secondary}
          opacity={flame.active ? 0.95 : 0.4}
        />
      </svg>
    </motion.span>
  );
}
