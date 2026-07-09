import Link from "next/link";
import { notFound } from "next/navigation";
import { ThinkerLifeReader } from "@/components/thinkers/thinker-life-reader";
import {
  EditorialCard,
  EditorialPageHero,
  EditorialPill,
  SectionHeader,
  mutedText,
} from "@/components/ui/editorial";
import { SKILL_LABELS } from "@/lib/constants/skills";
import { getThinkerGallery } from "@/lib/content/gallery";
import {
  getAllQuoteCards,
  getAllThinkers,
  getLessonsForThinker,
  getLifeStoryForThinker,
  getThinkerBySlug,
} from "@/lib/content/loaders";
import { LIFE_STORY_PAGE_COUNT } from "@/lib/content/schemas";

export function generateStaticParams() {
  return getAllThinkers().map((thinker) => ({ slug: thinker.slug }));
}

export default async function ThinkerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const thinker = getThinkerBySlug(slug);
  if (!thinker) {
    notFound();
  }

  const lessons = getLessonsForThinker(thinker.id);
  const lifeStory = getLifeStoryForThinker(thinker.id);
  if (!lifeStory) {
    notFound();
  }
  const gallery = getThinkerGallery(thinker.slug);
  const quotes = getAllQuoteCards().filter(
    (quote) => quote.thinkerId === thinker.id,
  );

  return (
    <div className="space-y-8">
      <EditorialPageHero
        eyebrow={`${thinker.era} · ${thinker.region}`}
        title={thinker.name}
        description={thinker.summary}
      >
        <p className="max-w-3xl font-serif text-2xl leading-relaxed">
          {thinker.hook}
        </p>
        <div className="flex flex-wrap gap-2">
          {thinker.skills.map((skill) => (
            <EditorialPill key={skill}>
              {SKILL_LABELS[skill]}
            </EditorialPill>
          ))}
        </div>
      </EditorialPageHero>

      <ThinkerLifeReader
        thinkerName={thinker.name}
        thinkerSlug={thinker.slug}
        pages={lifeStory.pages}
        desktopImages={gallery.desktopImages.slice(0, LIFE_STORY_PAGE_COUNT)}
        mobileImages={gallery.mobileImages.slice(0, LIFE_STORY_PAGE_COUNT)}
        captions={gallery.captions.slice(0, LIFE_STORY_PAGE_COUNT)}
      />

      <section className="space-y-4">
        <SectionHeader eyebrow="Introspection" title="Journey" />
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/thinkers/${thinker.slug}/lessons/${lesson.id}`}
              className="group block"
            >
              <EditorialCard className="transition hover:border-[var(--color-accent)]">
                <div className="absolute -right-12 -top-12 size-28 rounded-full bg-yellow-400/10 transition group-hover:bg-yellow-400/20" />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm ${mutedText}`}>
                      Lesson {lesson.order}
                    </p>
                    <h4 className="text-xl font-extrabold tracking-tight">
                      {lesson.title}
                    </h4>
                  </div>
                  <span className="text-sm text-[var(--color-accent)]">
                    {lesson.estimatedMinutes} min
                  </span>
                </div>
              </EditorialCard>
            </Link>
          ))}
        </div>
      </section>

      {quotes.length > 0 && (
        <section className="space-y-4">
          <SectionHeader eyebrow="Reflection" title="Quote Cards" />
          <div className="grid gap-4 sm:grid-cols-2">
            {quotes.map((quote) => (
              <Link key={quote.id} href={`/quotes/${quote.id}`} className="group block">
                <EditorialCard className="transition hover:border-[var(--color-accent)]">
                  <div className="absolute -right-12 -top-12 size-28 rounded-full bg-yellow-400/10 transition group-hover:bg-yellow-400/20" />
                  <p className="font-serif text-xl leading-relaxed">
                    &ldquo;{quote.quote}&rdquo;
                  </p>
                </EditorialCard>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
