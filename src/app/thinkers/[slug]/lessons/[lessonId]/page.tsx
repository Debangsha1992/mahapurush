import { notFound } from "next/navigation";
import { LessonFlow } from "@/components/lesson/lesson-flow";
import { getThinkerGallery } from "@/lib/content/gallery";
import {
  getAllThinkers,
  getLessonById,
  getLessonsForThinker,
  getLifeStoryForThinker,
  getThinkerBySlug,
} from "@/lib/content/loaders";

export function generateStaticParams() {
  return getAllThinkers().flatMap((thinker) =>
    getLessonsForThinker(thinker.id).map((lesson) => ({
      slug: thinker.slug,
      lessonId: lesson.id,
    })),
  );
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const thinker = getThinkerBySlug(slug);
  const lesson = getLessonById(lessonId);

  if (!thinker || !lesson || lesson.thinkerId !== thinker.id) {
    notFound();
  }

  const gallery = getThinkerGallery(thinker.slug);
  const lifeStory = getLifeStoryForThinker(thinker.id);
  if (!lifeStory) {
    notFound();
  }

  return (
    <LessonFlow
      lesson={lesson}
      thinkerName={thinker.name}
      thinkerSlug={thinker.slug}
      desktopImages={gallery.desktopImages}
      mobileImages={gallery.mobileImages}
      galleryCaptions={gallery.captions}
      lifePages={lifeStory.pages}
      layerKey="full"
    />
  );
}
