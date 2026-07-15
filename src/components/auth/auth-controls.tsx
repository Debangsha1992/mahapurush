"use client";

import Link from "next/link";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { cn } from "@/lib/utils";

type AuthControlsProps = {
  className?: string;
  compact?: boolean;
};

export function AuthControls({ className, compact = false }: AuthControlsProps) {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Link
          href="/login"
          className={cn(
            "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)] transition hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]",
            compact && "px-2 py-1",
          )}
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className={cn(
            "rounded-full bg-[var(--color-accent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#101014] transition hover:bg-[var(--color-accent-soft)]",
            compact && "px-2 py-1",
          )}
        >
          Sign up
        </Link>
      </div>
    );
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <p
        className={cn(
          "max-w-[12rem] truncate text-xs font-medium text-[var(--color-text)] sm:max-w-[16rem]",
          compact && "max-w-[9rem]",
        )}
        title={user.email}
      >
        {displayName}
      </p>
      <button
        type="button"
        onClick={() => {
          void signOut({ returnTo: "/" });
        }}
        className={cn(
          "rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]",
          compact && "px-2 py-1",
        )}
      >
        Sign out
      </button>
    </div>
  );
}
