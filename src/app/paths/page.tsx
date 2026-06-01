import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getAllPaths } from "@/lib/content/loaders";

export default function PathsPage() {
  const paths = getAllPaths();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Learning Paths</h2>
        <p className="mt-2 text-[var(--color-muted)]">
          Choose a path based on the kind of thinking you want to practice.
        </p>
      </div>
      <div className="grid gap-4">
        {paths.map((path) => (
          <Link key={path.id} href={`/paths/${path.slug}`}>
            <Card className="transition hover:border-[var(--color-accent)]">
              <h3 className="text-xl font-semibold">{path.title}</h3>
              <p className="mt-2 text-[var(--color-muted)]">{path.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
