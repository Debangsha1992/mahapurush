import { HomeDashboard } from "@/components/home/home-dashboard";
import { getThinkerGallery } from "@/lib/content/gallery";
import {
  getAllPaths,
  getAllThinkers,
  getDailySparkForDate,
  getLessonsForThinker,
  getThinkerBySlug,
} from "@/lib/content/loaders";

export default function HomePage() {
  const dailySpark = getDailySparkForDate();
  const thinker = getThinkerBySlug(
    getAllThinkers().find((item) => item.id === dailySpark.thinkerId)?.slug ?? "",
  );
  const gallery = thinker
    ? getThinkerGallery(thinker.slug)
    : { desktopImages: [], mobileImages: [], captions: [] };
  const lessonCounts = Object.fromEntries(
    getAllThinkers().map((item) => [item.id, getLessonsForThinker(item.id).length]),
  );

  return (
    <HomeDashboard
      dailySpark={dailySpark}
      thinker={thinker}
      paths={getAllPaths()}
      lessonCounts={lessonCounts}
      desktopImages={gallery.desktopImages}
      mobileImages={gallery.mobileImages}
      galleryCaptions={gallery.captions}
    />
  );
}
