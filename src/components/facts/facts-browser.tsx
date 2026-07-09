"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getFactCardGestureIntent,
  getTouchGestureDelta,
} from "@/lib/content/fact-card-gesture";
import { chooseNextFact } from "@/lib/content/fact-rotation";
import { getPublicPersonSummary } from "@/lib/content/public-copy";
import type { FactWithPerson } from "@/lib/content/schemas";

type FactBatchResponse = {
  facts: FactWithPerson[];
};

const editorialPanel =
  "border-white/10 bg-[#0b0b0f] shadow-none ring-1 ring-white/5";
const editorialEyebrow =
  "text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]";
const mutedText = "text-[var(--color-muted)]";

function indexesExcept(length: number, excludedIndex: number): number[] {
  return Array.from({ length }, (_, index) => index).filter(
    (index) => index !== excludedIndex,
  );
}

export function FactsBrowser({ facts }: { facts: FactWithPerson[] }) {
  const [factPool, setFactPool] = useState(facts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingIndexes, setRemainingIndexes] = useState(() =>
    indexesExcept(facts.length, 0),
  );
  const [loadingNextBatch, setLoadingNextBatch] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const gestureLocked = useRef(false);

  if (factPool.length === 0) {
    return (
      <Card className={`mx-auto max-w-2xl space-y-4 p-8 ${editorialPanel}`}>
        <p className={editorialEyebrow}>Facts Mode</p>
        <h2 className="text-4xl font-extrabold tracking-tight">
          No approved facts yet
        </h2>
        <p className={mutedText}>
          Approve source-backed facts before they appear in this mode.
        </p>
      </Card>
    );
  }

  const currentFact = factPool[currentIndex] ?? factPool[0];
  const person = currentFact.person;
  const publicPersonSummary = getPublicPersonSummary(person.summary);

  async function loadNextBatch() {
    setLoadingNextBatch(true);
    try {
      const seed = `${Date.now()}-${currentFact.id}`;
      const excludedFactIds = factPool.map((fact) => fact.id).join(",");
      const response = await fetch(
        `/api/facts/batch?seed=${encodeURIComponent(seed)}&limit=20&exclude=${encodeURIComponent(excludedFactIds)}`,
      );
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as FactBatchResponse;
      if (data.facts.length === 0) {
        return;
      }
      setFactPool(data.facts);
      setCurrentIndex(0);
      setRemainingIndexes(indexesExcept(data.facts.length, 0));
    } finally {
      setLoadingNextBatch(false);
    }
  }

  async function showNextFact() {
    const nextFact = chooseNextFact({ remainingIndexes });
    if (nextFact.type === "load-next-batch") {
      await loadNextBatch();
      return;
    }

    setCurrentIndex(nextFact.nextIndex);
    setRemainingIndexes(nextFact.remainingIndexes);
  }

  function releaseGestureLock() {
    window.setTimeout(() => {
      gestureLocked.current = false;
    }, 450);
  }

  function handleFactGesture(deltaY: number) {
    if (gestureLocked.current || loadingNextBatch) {
      return;
    }

    if (getFactCardGestureIntent({ deltaY }) === "ignore") {
      return;
    }

    gestureLocked.current = true;
    void showNextFact().finally(releaseGestureLock);
  }

  return (
    <div className="mx-auto max-w-5xl pb-24 md:space-y-8">
      <div
        data-facts-mobile-deck
        className="md:hidden"
        onWheel={(event) => handleFactGesture(event.deltaY)}
        onTouchStart={(event) => {
          touchStartY.current = event.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(event) => {
          const startY = touchStartY.current;
          const endY = event.changedTouches[0]?.clientY;
          touchStartY.current = null;
          if (startY === null || endY === undefined) {
            return;
          }
          handleFactGesture(getTouchGestureDelta({ startY, endY }));
        }}
      >
        <div className="relative h-[calc(100svh-19.5rem)] min-h-[500px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#08080b] p-4 ring-1 ring-white/5 [perspective:1200px] perspective-[1200px]">
          <div className="absolute -right-24 -top-24 size-64 rounded-full bg-yellow-400/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-yellow-400/10 blur-2xl" />
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#101014]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)] [transform:rotateX(3deg)_rotateY(-4deg)]">
            <div
              aria-hidden="true"
              className="absolute inset-x-8 -bottom-4 -z-10 h-16 rounded-[1.5rem] border border-white/10 bg-white/[0.04] blur-[1px]"
            />
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={editorialEyebrow}>Facts Mode</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-foreground/50">
                    {person.era} · {person.region}
                  </p>
                </div>
                <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                  3D Card
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-extrabold leading-none tracking-tight">
                {person.name}
              </h2>
              <p className="mt-4 line-clamp-4 font-serif text-2xl leading-tight">
                {currentFact.text}
              </p>

              <div className="mt-5 border-t border-white/10 pt-4">
                <h3 className={editorialEyebrow}>Worth knowing</h3>
                <p className={`mt-3 max-h-24 overflow-y-auto leading-7 ${mutedText}`}>
                  {currentFact.context}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {currentFact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.14em] text-foreground/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
                {loadingNextBatch
                  ? "Loading another set of Facts"
                  : "Scroll for another Fact"}
              </p>
              <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
                <a
                  href={currentFact.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--color-accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                >
                  Source: {currentFact.sourceTitle}
                </a>
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href={`/people/${person.slug}`}
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                  >
                    View in library
                  </Link>
                  {currentFact.thinkerSlug && (
                    <Link
                      href={`/thinkers/${currentFact.thinkerSlug}`}
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                    >
                      View profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div data-facts-desktop-layout className="hidden md:block">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0f] p-6 ring-1 ring-white/5 md:p-10">
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-yellow-400/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={editorialEyebrow}>Facts Mode</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-none tracking-tight sm:text-5xl md:text-7xl">
              Cool facts about notable people
            </h2>
            <p className={`mt-4 max-w-2xl leading-7 md:text-lg md:leading-8 ${mutedText}`}>
              Scroll through bite-sized, source-backed stories from people who
              shaped science, culture, public life, and human understanding.
            </p>
          </div>
          <Button
            onClick={showNextFact}
            disabled={loadingNextBatch}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
          >
            {loadingNextBatch ? "Loading..." : "Next fact"}
          </Button>
        </div>
      </div>

      <Card className={`relative overflow-hidden p-8 md:p-10 ${editorialPanel}`}>
        <div className="absolute -left-20 top-20 size-48 rounded-full bg-yellow-400/10" />
        <div className="relative grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className={editorialEyebrow}>Facts Mode</p>
            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-foreground/60">
              {person.era} · {person.region}
            </p>
            <h3 className="mt-3 text-4xl font-extrabold leading-none tracking-tight">
              {person.name}
            </h3>
            {publicPersonSummary && (
              <p className={`mt-5 leading-8 ${mutedText}`}>
                {publicPersonSummary}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              {currentFact.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.14em] text-foreground/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="font-serif text-4xl leading-tight md:text-5xl">
              {currentFact.text}
            </p>

            <div className="mt-8 border-t border-white/10 pt-6">
              <h4 className={editorialEyebrow}>Worth knowing</h4>
              <p className={`mt-4 leading-8 ${mutedText}`}>
                {currentFact.context}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className={`text-sm ${mutedText}`}>
                Source:{" "}
                <a
                  href={currentFact.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--color-accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                >
                  {currentFact.sourceTitle}
                </a>
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/people/${person.slug}`}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                >
                  View in library
                </Link>
                {currentFact.thinkerSlug && (
                  <Link
                    href={`/thinkers/${currentFact.thinkerSlug}`}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                  >
                    View profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
