import Image from "next/image";
import Link from "next/link";
import { PERSON_DOMAIN_LABELS } from "@/lib/constants/person-domains";
import { getPublicPersonSummary } from "@/lib/content/public-copy";
import type { PersonSummary } from "@/lib/content/schemas";
import { EditorialCard, EditorialPill, mutedText } from "@/components/ui/editorial";

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function PersonCard({ person }: { person: PersonSummary }) {
  const publicSummary = getPublicPersonSummary(person.summary);

  return (
    <Link href={`/people/${person.slug}`} className="group block h-full">
      <EditorialCard className="h-full transition hover:border-[var(--color-accent)]">
        <div className="absolute -right-12 -top-12 size-28 rounded-full bg-yellow-400/10 transition group-hover:bg-yellow-400/20" />
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
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                {PERSON_DOMAIN_LABELS[person.primaryDomain]}
              </p>
              <h3 className="mt-2 text-xl font-extrabold tracking-tight">{person.name}</h3>
              <p className={`mt-1 text-sm ${mutedText}`}>
                {person.era} · {person.region}
              </p>
            </div>
          </div>
          {publicSummary && (
            <p className={`text-sm leading-6 ${mutedText}`}>
              {publicSummary}
            </p>
          )}
          <div className="mt-auto flex flex-wrap gap-2">
            {person.knownFor.slice(0, 2).map((item) => (
              <EditorialPill key={item}>
                {item}
              </EditorialPill>
            ))}
          </div>
        </div>
      </EditorialCard>
    </Link>
  );
}
