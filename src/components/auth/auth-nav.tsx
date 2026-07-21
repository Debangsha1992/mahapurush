"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { AUTH_LOGIN_PATH, AUTH_LOGOUT_PATH } from "@/lib/auth/routes";

const authLinkClassName =
  "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]";

export function AuthNav() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
        …
      </span>
    );
  }

  if (!user) {
    // Full document navigation: /login and /logout redirect off-app (AuthKit).
    // Next <Link> soft-nav tries an RSC fetch that fails on external 307s.
    return (
      <a href={AUTH_LOGIN_PATH} className={authLinkClassName}>
        Sign in
      </a>
    );
  }

  const label = user.firstName?.trim() || user.email;

  return (
    <div className="flex items-center gap-3">
      <span
        className="hidden max-w-[10rem] truncate text-xs text-[var(--color-muted)] sm:inline"
        title={user.email}
      >
        {label}
      </span>
      <a href={AUTH_LOGOUT_PATH} className={authLinkClassName}>
        Sign out
      </a>
    </div>
  );
}
