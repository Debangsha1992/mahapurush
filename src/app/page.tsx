import { HomeDashboard } from "@/components/home/home-dashboard";
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
  const lessonCounts = Object.fromEntries(
    getAllThinkers().map((item) => [item.id, getLessonsForThinker(item.id).length]),
  );

  return (
    <HomeDashboard
      dailySpark={dailySpark}
      thinker={thinker}
      paths={getAllPaths()}
      lessonCounts={lessonCounts}
    />
  );
}
