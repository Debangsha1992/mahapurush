import Link from "next/link";
import { notFound } from "next/navigation";
import { ThinkerMedia } from "@/components/thinkers/thinker-media";
import {
  EditorialCard,
  EditorialPageHero,
  mutedText,
} from "@/components/ui/editorial";
import {
  getAllPaths,
  getAllThinkers,
  getLessonsForThinker,
  getPathBySlug,
} from "@/lib/content/loaders";

export function generateStaticParams() {
  return getAllPaths().map((path) => ({ slug: path.slug }));
}

export default async function PathDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const path = getPathBySlug(slug);
  if (!path) {
    notFound();
  }

  const thinkers = getAllThinkers().filter((thinker) =>
    path.thinkerIds.includes(thinker.id),
  );

  return (
    <div className="space-y-6">
      <EditorialPageHero
        eyebrow="Path"
        title={path.title}
        description={path.description}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {thinkers.map((thinker) => {
          const firstLesson = getLessonsForThinker(thinker.id)[0];
          return (
            <EditorialCard key={thinker.id}>
              <div className="flex items-start gap-4">
                <ThinkerMedia slug={thinker.slug} name={thinker.name} size={72} />
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">{thinker.name}</h3>
                  <p className={`mt-2 text-sm ${mutedText}`}>
                    {thinker.summary}
                  </p>
                  {firstLesson && (
                    <Link
                      href={`/thinkers/${thinker.slug}/lessons/${firstLesson.id}`}
                      className="mt-4 inline-block text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]"
                    >
                      Start first lesson
                    </Link>
                  )}
                </div>
              </div>
            </EditorialCard>
          );
        })}
      </div>
    </div>
  );
}
