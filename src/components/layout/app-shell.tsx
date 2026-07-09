import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/people", label: "People" },
  { href: "/paths", label: "Paths" },
  { href: "/journal", label: "Journal" },
  { href: "/you", label: "You" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-24 pt-6 sm:px-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="MindSpark home"
            className="flex size-14 shrink-0 items-center justify-center rounded-[1.15rem] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)]"
          >
            <Image src="/logo.svg" alt="" width={56} height={56} priority />
          </Link>
          <div>
            <Link href="/" className="block">
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-muted)]">
                MindSpark
              </p>
              <h1 className="text-xl font-semibold text-[var(--color-text)] sm:text-2xl">
                Think Like the Greats
              </h1>
            </Link>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Inspired by Mahapurusher Mohakotha
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 border-t border-[var(--color-border)] bg-[rgba(16,16,20,0.96)] backdrop-blur"
      >
        <ul className="mx-auto flex max-w-5xl items-center justify-between px-2 py-3">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-full px-3 py-2 text-sm text-[var(--color-muted)] transition hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
