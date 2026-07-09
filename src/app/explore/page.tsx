import Link from "next/link";
import { ThinkerMedia } from "@/components/thinkers/thinker-media";
import {
  EditorialCard,
  EditorialPageHero,
  SectionHeader,
  mutedText,
} from "@/components/ui/editorial";
import { CATEGORY_LABELS } from "@/lib/constants/categories";
import { getAllThinkers } from "@/lib/content/loaders";

export default function ExplorePage() {
  const thinkers = getAllThinkers();
  const categories = [...new Set(thinkers.flatMap((thinker) => thinker.categories))];

  return (
    <div className="space-y-8">
      <EditorialPageHero
        eyebrow="Explore"
        title="Thinker Library"
        description="Explore great minds by the problems modern life keeps asking."
      />

      {categories.map((category) => (
        <section key={category} className="space-y-4">
          <SectionHeader eyebrow="Category" title={CATEGORY_LABELS[category]} />
          <div className="grid gap-4 sm:grid-cols-2">
            {thinkers
              .filter((thinker) => thinker.categories.includes(category))
              .map((thinker) => (
                <Link
                  key={thinker.id}
                  href={`/thinkers/${thinker.slug}`}
                  className="group block"
                >
                  <EditorialCard className="transition hover:border-[var(--color-accent)]">
                    <div className="absolute -right-12 -top-12 size-28 rounded-full bg-yellow-400/10 transition group-hover:bg-yellow-400/20" />
                    <div className="flex items-start gap-4">
                      <ThinkerMedia slug={thinker.slug} name={thinker.name} size={72} />
                      <div>
                        <h4 className="text-xl font-extrabold tracking-tight">{thinker.name}</h4>
                        <p className={`mt-2 text-sm ${mutedText}`}>
                          {thinker.hook}
                        </p>
                      </div>
                    </div>
                  </EditorialCard>
                </Link>
              ))}
          </div>
        </section>
      ))}

      <section className="space-y-4">
        <SectionHeader eyebrow="Directory" title="All Thinkers" />
        <div className="grid gap-4 sm:grid-cols-2">
          {thinkers.map((thinker) => (
            <Link key={thinker.id} href={`/thinkers/${thinker.slug}`} className="group block">
              <EditorialCard className="transition hover:border-[var(--color-accent)]">
                <div className="absolute -right-12 -top-12 size-28 rounded-full bg-yellow-400/10 transition group-hover:bg-yellow-400/20" />
                <h4 className="text-xl font-extrabold tracking-tight">{thinker.name}</h4>
                <p className={`mt-2 text-sm ${mutedText}`}>{thinker.summary}</p>
              </EditorialCard>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
