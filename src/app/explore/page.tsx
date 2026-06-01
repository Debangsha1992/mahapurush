import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/constants/categories";
import { getAllThinkers } from "@/lib/content/loaders";

export default function ExplorePage() {
  const thinkers = getAllThinkers();
  const categories = [...new Set(thinkers.flatMap((thinker) => thinker.categories))];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold">Thinker Library</h2>
        <p className="mt-2 text-[var(--color-muted)]">
          Explore great minds by the problems teenagers care about.
        </p>
      </div>

      {categories.map((category) => (
        <section key={category} className="space-y-4">
          <h3 className="text-xl font-semibold">{CATEGORY_LABELS[category]}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {thinkers
              .filter((thinker) => thinker.categories.includes(category))
              .map((thinker) => (
                <Link key={thinker.id} href={`/thinkers/${thinker.slug}`}>
                  <Card className="transition hover:border-[var(--color-accent)]">
                    <div className="flex items-start gap-4">
                      <Image
                        src={thinker.portrait}
                        alt={thinker.name}
                        width={72}
                        height={72}
                        className="rounded-full"
                      />
                      <div>
                        <h4 className="text-lg font-semibold">{thinker.name}</h4>
                        <p className="mt-2 text-sm text-[var(--color-muted)]">
                          {thinker.hook}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        </section>
      ))}

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">All Thinkers</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {thinkers.map((thinker) => (
            <Link key={thinker.id} href={`/thinkers/${thinker.slug}`}>
              <Card className="transition hover:border-[var(--color-accent)]">
                <h4 className="text-lg font-semibold">{thinker.name}</h4>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{thinker.summary}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
