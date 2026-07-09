import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PERSON_DOMAIN_LABELS } from "@/lib/constants/person-domains";
import {
  getAllPeople,
  getAllThinkers,
  getPersonBySlug,
} from "@/lib/content/loaders";

export function generateStaticParams() {
  return getAllPeople().map((person) => ({ slug: person.slug }));
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const person = getPersonBySlug(slug);
  if (!person) {
    notFound();
  }

  const thinkerSlug = person.thinkerId
    ? getAllThinkers().find((thinker) => thinker.id === person.thinkerId)?.slug
    : undefined;

  return (
    <div className="space-y-6">
      <Link href="/people" className="text-sm text-[var(--color-accent)]">
        Back to People Library
      </Link>

      <Card className="space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            {PERSON_DOMAIN_LABELS[person.primaryDomain]} · {person.region}
          </p>
          <h2 className="mt-2 text-3xl font-semibold">{person.name}</h2>
          <p className="mt-2 text-[var(--color-muted)]">
            {person.era}
            {person.featuredRank ? ` · Featured #${person.featuredRank}` : ""}
          </p>
        </div>

        <p className="font-serif text-2xl leading-relaxed">{person.summary}</p>

        <div className="flex flex-wrap gap-2">
          {person.knownFor.map((item) => (
            <span
              key={item}
              className="rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-sm text-[var(--color-muted)]"
            >
              {item}
            </span>
          ))}
        </div>

        {person.sensitiveContextNote && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 text-sm leading-6 text-[var(--color-muted)]">
            {person.sensitiveContextNote}
          </div>
        )}

        {thinkerSlug && (
          <Link
            href={`/thinkers/${thinkerSlug}`}
            className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 py-3 text-sm font-medium transition hover:border-[var(--color-accent)]"
          >
            Open Introspection profile
          </Link>
        )}
      </Card>

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold">Source-backed facts</h3>
        <div className="grid gap-4">
          {person.facts
            .filter((fact) => fact.verified)
            .map((fact) => (
              <Card key={fact.id} className="space-y-4">
                <p className="font-serif text-2xl leading-relaxed">
                  &ldquo;{fact.text}&rdquo;
                </p>
                <p className="leading-7 text-[var(--color-muted)]">{fact.context}</p>
                <a
                  href={fact.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-accent)]"
                >
                  Source: {fact.sourceTitle}
                </a>
              </Card>
            ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Profile sources</h3>
        <div className="flex flex-wrap gap-3">
          {person.sourceRefs.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
            >
              {source.title}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
