import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PERSON_DOMAIN_LABELS } from "@/lib/constants/person-domains";
import type { PersonSummary } from "@/lib/content/schemas";

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function PersonCard({ person }: { person: PersonSummary }) {
  return (
    <Link href={`/people/${person.slug}`} className="block h-full">
      <Card className="h-full transition hover:border-[var(--color-accent)]">
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-surface-raised)] text-lg font-semibold text-[var(--color-accent)]">
              {person.portrait ? (
                <Image
                  src={person.portrait}
                  alt={person.imageAlt ?? person.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span aria-hidden="true">{initialsFor(person.name)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-accent)]">
                {PERSON_DOMAIN_LABELS[person.primaryDomain]}
              </p>
              <h3 className="mt-2 text-lg font-semibold">{person.name}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {person.era} · {person.region}
              </p>
            </div>
          </div>
          <p className="text-sm leading-6 text-[var(--color-muted)]">
            {person.summary}
          </p>
          <div className="mt-auto flex flex-wrap gap-2">
            {person.knownFor.slice(0, 2).map((item) => (
              <span
                key={item}
                className="rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-xs text-[var(--color-muted)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}
