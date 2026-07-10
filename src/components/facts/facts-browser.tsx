"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

function getMobileFactTextClass(text: string): string {
  if (text.length > 220) {
    return "text-lg leading-snug";
  }
  if (text.length > 150) {
    return "text-xl leading-tight";
  }
  return "text-[clamp(1.35rem,5.6vw,1.85rem)] leading-tight";
}

function getMobileTakeawayTextClass(text: string): string {
  return text.length > 220 ? "text-xs leading-5" : "text-sm leading-6";
}

function indexesExcept(length: number, excludedIndex: number): number[] {
  return Array.from({ length }, (_, index) => index).filter(
    (index) => index !== excludedIndex,
  );
}

export function FactsBrowser({ facts }: { facts: FactWithPerson[] }) {
  const router = useRouter();
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

  function handleFactKey(key: string): boolean {
    if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(key)) {
      return false;
    }

    if (gestureLocked.current || loadingNextBatch) {
      return true;
    }

    gestureLocked.current = true;
    void showNextFact().finally(releaseGestureLock);
    return true;
  }

  return (
    <div className="mx-auto max-w-5xl md:space-y-8 md:pb-24">
      <div
        data-facts-mobile-deck
        role="region"
        aria-label="Facts Mode swipe cards"
        tabIndex={0}
        className="fixed inset-0 z-50 flex touch-none items-center justify-center overflow-hidden bg-[#f7f1e7] px-4 py-5 text-[#17130e] md:hidden"
        onWheel={(event) => {
          event.preventDefault();
          handleFactGesture(event.deltaY);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            router.push("/");
          }
        }}
        onKeyDown={(event) => {
          if (handleFactKey(event.key)) {
            event.preventDefault();
          }
        }}
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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#eadfcd]/80 to-transparent" />
        <div className="relative h-[min(42rem,calc(100svh-2.5rem))] w-full max-w-[27rem] overflow-hidden rounded-[2rem] border border-[#d9c59f] bg-[#fffaf1] p-4 shadow-[0_24px_80px_rgba(55,42,22,0.18)]">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 size-56 rounded-full bg-[#f3cf7a]/35 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-20 -left-20 size-52 rounded-full bg-[#e3a32d]/15 blur-2xl"
          />
          <section className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.55rem] border border-[#ead8b6] bg-[#fffdf7]/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#d99a2b]/45 to-transparent"
            />
            <div
              key={currentFact.id}
              aria-live="polite"
              className="animate-[fact-card-refresh_260ms_ease-out]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={editorialEyebrow}>Facts Mode</p>
                  <p className="mt-2 text-[0.65rem] uppercase tracking-[0.16em] text-[#776b5b]">
                    {person.era} · {person.region}
                  </p>
                </div>
                <Link
                  href="/"
                  aria-label="Exit Facts Mode"
                  className="inline-flex min-h-10 items-center rounded-full border border-[#d9c59f] bg-[#f8edda] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#554835] transition hover:border-[var(--color-accent)] hover:text-[#17130e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                >
                  Close
                </Link>
              </div>

              <h2 className="mt-3 text-[clamp(1.55rem,6vw,2rem)] font-extrabold leading-none tracking-tight">
                {person.name}
              </h2>
              <p
                className={`mt-3 font-serif ${getMobileFactTextClass(currentFact.text)}`}
              >
                {currentFact.text}
              </p>

              <div className="mt-4 rounded-[1.25rem] border border-[#e5bd58]/60 bg-[#fff4d6] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <h3 className={editorialEyebrow}>Worth knowing</h3>
                <p
                  className={`mt-2 text-[#675b4c] ${getMobileTakeawayTextClass(currentFact.context)}`}
                >
                  {currentFact.context}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {currentFact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#d9c59f] bg-[#f8edda] px-3 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-[#675b4c]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#776b5b]">
                {loadingNextBatch
                  ? "Loading another set of Facts"
                  : "Swipe up or down for another fact"}
              </p>
              <div className="flex items-center justify-center gap-3 border-t border-[#ead8b6] pt-2 text-xs text-[#776b5b]">
                <a
                  href={currentFact.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Source: ${currentFact.sourceTitle}`}
                  className="font-semibold text-[#a96f14] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                >
                  Source
                </a>
                <span aria-hidden="true">/</span>
                <Link
                  href={`/people/${person.slug}`}
                  className="font-semibold transition hover:text-[#17130e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                >
                  Library
                </Link>
                {currentFact.thinkerSlug && (
                  <>
                    <span aria-hidden="true">/</span>
                    <Link
                      href={`/thinkers/${currentFact.thinkerSlug}`}
                      className="font-semibold transition hover:text-[#17130e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
                    >
                      Profile
                    </Link>
                  </>
                )}
              </div>
            </div>
          </section>
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
