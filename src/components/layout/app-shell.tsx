"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthNav } from "@/components/auth/auth-nav";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/people", label: "People" },
  { href: "/paths", label: "Paths" },
  { href: "/journal", label: "Journal" },
  { href: "/you", label: "You" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      className={cn(
        "mx-auto flex min-h-screen w-full flex-col",
        !isHome && "pb-24",
        isHome ? "max-w-none px-0 pt-0" : "max-w-5xl px-4 pt-6 sm:px-6",
      )}
    >
      {isHome ? (
        <div className="pointer-events-none fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
          <div className="pointer-events-auto">
            <AuthNav />
          </div>
        </div>
      ) : (
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="MindSpark home"
              className="flex size-14 shrink-0 items-center justify-center rounded-[1.15rem] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] ring-1 ring-white/5"
            >
              <Image src="/logo.svg" alt="" width={56} height={56} priority />
            </Link>
            <div>
              <Link href="/" className="block">
                <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  MindSpark
                </p>
                <h1 className="text-xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-2xl">
                  Think Like the Greats
                </h1>
              </Link>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Inspired by Mahapurusher Mohakotha
              </p>
            </div>
          </div>
          <AuthNav />
        </header>
      )}
      <main className="flex-1">{children}</main>
      {!isHome && (
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 border-t border-[var(--color-border)] bg-[var(--color-nav-bg)] backdrop-blur"
        >
          <ul className="mx-auto flex max-w-5xl items-center justify-between px-2 py-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]",
                    isActivePath(pathname, item.href)
                      ? "bg-yellow-400/10 text-[var(--color-accent)]"
                      : "text-[var(--color-muted)]",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
