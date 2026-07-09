import Link from "next/link";
import {
  EditorialCard,
  EditorialPageHero,
  mutedText,
} from "@/components/ui/editorial";
import { getAllPaths } from "@/lib/content/loaders";

export default function PathsPage() {
  const paths = getAllPaths();

  return (
    <div className="space-y-6">
      <EditorialPageHero
        eyebrow="Paths"
        title="Learning Paths"
        description="Choose a path based on the kind of thinking you want to practice."
      />
      <div className="grid gap-4">
        {paths.map((path) => (
          <Link key={path.id} href={`/paths/${path.slug}`} className="group block">
            <EditorialCard className="transition hover:border-[var(--color-accent)]">
              <div className="absolute -right-14 -top-14 size-32 rounded-full bg-yellow-400/10 transition group-hover:bg-yellow-400/20" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Journey
              </p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight">
                {path.title}
              </h3>
              <p className={`mt-3 max-w-2xl leading-7 ${mutedText}`}>
                {path.description}
              </p>
            </EditorialCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
