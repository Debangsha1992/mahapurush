import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ThinkerLifeReader } from "@/components/thinkers/thinker-life-reader";
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
      <Card>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            {thinker.era} · {thinker.region}
          </p>
          <h2 className="mt-2 text-3xl font-semibold">{thinker.name}</h2>
          <p className="mt-3 font-serif text-xl leading-relaxed">{thinker.hook}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {thinker.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-sm"
              >
                {SKILL_LABELS[skill]}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <ThinkerLifeReader
        thinkerName={thinker.name}
        thinkerSlug={thinker.slug}
        pages={lifeStory.pages}
        desktopImages={gallery.desktopImages.slice(0, LIFE_STORY_PAGE_COUNT)}
        mobileImages={gallery.mobileImages.slice(0, LIFE_STORY_PAGE_COUNT)}
        captions={gallery.captions.slice(0, LIFE_STORY_PAGE_COUNT)}
      />

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold">Journey</h3>
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/thinkers/${thinker.slug}/lessons/${lesson.id}`}
            >
              <Card className="transition hover:border-[var(--color-accent)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-[var(--color-muted)]">
                      Lesson {lesson.order}
                    </p>
                    <h4 className="text-lg font-semibold">{lesson.title}</h4>
                  </div>
                  <span className="text-sm text-[var(--color-accent)]">
                    {lesson.estimatedMinutes} min
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {quotes.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">Quote Cards</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {quotes.map((quote) => (
              <Link key={quote.id} href={`/quotes/${quote.id}`}>
                <Card className="transition hover:border-[var(--color-accent)]">
                  <p className="font-serif text-xl leading-relaxed">
                    &ldquo;{quote.quote}&rdquo;
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
