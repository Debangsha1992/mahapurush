import Link from "next/link";
import { notFound } from "next/navigation";
import { PERSON_DOMAIN_LABELS } from "@/lib/constants/person-domains";
import {
  getAllPeople,
  getAllThinkers,
  getApprovedFactsForPerson,
  getPersonBySlug,
} from "@/lib/content/loaders";
import { getPublicPersonSummary } from "@/lib/content/public-copy";
import {
  EditorialCard,
  EditorialPageHero,
  EditorialPill,
  mutedText,
} from "@/components/ui/editorial";

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
  const approvedFacts = getApprovedFactsForPerson(person);
  const publicSummary = getPublicPersonSummary(person.summary);

  return (
    <div className="space-y-6">
      <Link href="/people" className="text-sm text-[var(--color-accent)]">
        Back to People Library
      </Link>

      <EditorialPageHero
        eyebrow={`${PERSON_DOMAIN_LABELS[person.primaryDomain]} · ${person.region}`}
        title={person.name}
        description={`${person.era}${person.featuredRank ? ` · Featured #${person.featuredRank}` : ""}`}
      >
        {publicSummary && (
          <p className="max-w-3xl font-serif text-2xl leading-relaxed">
            {publicSummary}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {person.knownFor.map((item) => (
            <EditorialPill key={item}>
              {item}
            </EditorialPill>
          ))}
        </div>

        {person.sensitiveContextNote && (
          <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 ${mutedText}`}>
            {person.sensitiveContextNote}
          </div>
        )}

        {thinkerSlug && (
          <Link
            href={`/thinkers/${thinkerSlug}`}
            className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium transition hover:border-[var(--color-accent)]"
          >
            Open Introspection profile
          </Link>
        )}
      </EditorialPageHero>

      <section className="space-y-4">
        <h3 className="text-3xl font-extrabold tracking-tight">Source-backed facts</h3>
        <div className="grid gap-4">
          {approvedFacts.length === 0 ? (
            <EditorialCard className="space-y-3">
              <p className="text-lg font-semibold">No approved facts yet</p>
              <p className={`leading-7 ${mutedText}`}>
                This person is awaiting source-backed editorial review.
              </p>
            </EditorialCard>
          ) : (
            approvedFacts.map((fact) => (
              <EditorialCard key={fact.id} className="space-y-4">
                <p className="font-serif text-2xl leading-relaxed">
                  &ldquo;{fact.text}&rdquo;
                </p>
                <p className={`leading-7 ${mutedText}`}>{fact.context}</p>
                <a
                  href={fact.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-accent)]"
                >
                  Source: {fact.sourceTitle}
                </a>
              </EditorialCard>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-2xl font-extrabold tracking-tight">Profile sources</h3>
        <div className="flex flex-wrap gap-3">
          {person.sourceRefs.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)] ${mutedText}`}
            >
              {source.title}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
