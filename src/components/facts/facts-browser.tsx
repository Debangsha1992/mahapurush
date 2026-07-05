"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FactWithPerson } from "@/lib/content/schemas";

function indexesExcept(length: number, excludedIndex: number): number[] {
  return Array.from({ length }, (_, index) => index).filter(
    (index) => index !== excludedIndex,
  );
}

export function FactsBrowser({ facts }: { facts: FactWithPerson[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingIndexes, setRemainingIndexes] = useState(() =>
    indexesExcept(facts.length, 0),
  );

  if (facts.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl space-y-3">
        <h2 className="text-2xl font-semibold">No facts yet</h2>
        <p className="text-[var(--color-muted)]">
          Add verified facts in `content/people` to power this mode.
        </p>
      </Card>
    );
  }

  const currentFact = facts[currentIndex] ?? facts[0];
  const person = currentFact.person;

  function showNextFact() {
    const resetPool = indexesExcept(facts.length, currentIndex);
    const pool = remainingIndexes.length > 0 ? remainingIndexes : resetPool;
    if (pool.length === 0) {
      return;
    }

    const nextIndex = pool[Math.floor(Math.random() * pool.length)];
    setCurrentIndex(nextIndex);
    setRemainingIndexes(pool.filter((index) => index !== nextIndex));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Facts Mode
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            Random facts about notable people
          </h2>
          <p className="mt-3 text-[var(--color-muted)]">
            Discover source-backed moments from people who shaped science, culture,
            public life, and human understanding.
          </p>
        </div>
        <Button onClick={showNextFact} disabled={facts.length < 2}>
          Next fact
        </Button>
      </div>

      <Card className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
            {person.era} · {person.region}
          </p>
          <h3 className="mt-2 text-2xl font-semibold">{person.name}</h3>
          <p className="mt-3 text-[var(--color-muted)]">{person.summary}</p>
        </div>

        <p className="font-serif text-3xl leading-tight">&ldquo;{currentFact.text}&rdquo;</p>

        <div>
          <h4 className="font-semibold">Why it matters</h4>
          <p className="mt-2 leading-8 text-[var(--color-muted)]">
            {currentFact.context}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentFact.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-sm text-[var(--color-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--color-muted)]">
            Source:{" "}
            <a
              href={currentFact.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)]"
            >
              {currentFact.sourceTitle}
            </a>
          </p>
          <div className="flex flex-wrap gap-3">
            {currentFact.thinkerSlug && (
              <Link
                href={`/thinkers/${currentFact.thinkerSlug}`}
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 py-3 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)]"
              >
                View profile
              </Link>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
