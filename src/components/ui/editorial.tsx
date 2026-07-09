import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export const editorialPanel =
  "border-white/10 bg-[#0b0b0f] shadow-none ring-1 ring-white/5";

export const editorialEyebrow =
  "text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]";

export const mutedText = "text-[var(--color-muted)]";

export function EditorialPageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <Card className={`relative overflow-hidden p-8 md:p-10 ${editorialPanel}`}>
      <div className="absolute -right-24 -top-24 size-72 rounded-full bg-yellow-400/10" />
      <div className="relative">
        <p className={editorialEyebrow}>{eyebrow}</p>
        <h2 className="mt-4 max-w-4xl text-5xl font-extrabold leading-none tracking-tight md:text-7xl">
          {title}
        </h2>
        <p className={`mt-5 max-w-2xl text-lg leading-8 ${mutedText}`}>
          {description}
        </p>
        {children && <div className="mt-7">{children}</div>}
      </div>
    </Card>
  );
}

export function EditorialCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`relative overflow-hidden p-7 ${editorialPanel} ${className}`}>
      {children}
    </Card>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      {eyebrow && <p className={editorialEyebrow}>{eyebrow}</p>}
      <h3 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h3>
      {description && <p className={`mt-3 max-w-2xl leading-7 ${mutedText}`}>{description}</p>}
    </div>
  );
}

export function EditorialPill({
  children,
  active = false,
  className = "",
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em] ${
        active
          ? "border-[var(--color-accent)] bg-yellow-400/10 text-[var(--color-accent)]"
          : "border-white/10 bg-white/[0.04] text-foreground/60"
      } ${className}`}
    >
      {children}
    </span>
  );
}
