"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotatingThinkerImage } from "@/components/ui/rotating-thinker-image";
import type { LifeStoryPage } from "@/lib/content/schemas";

type ThinkerLifeReaderProps = {
  thinkerName: string;
  thinkerSlug: string;
  pages: LifeStoryPage[];
  desktopImages: string[];
  mobileImages: string[];
  captions: string[];
};

export function ThinkerLifeReader({
  thinkerName,
  thinkerSlug,
  pages,
  desktopImages,
  mobileImages,
  captions,
}: ThinkerLifeReaderProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = pages[pageIndex];
  const pageCount = pages.length;

  function goToPage(nextIndex: number) {
    setPageIndex(Math.max(0, Math.min(nextIndex, pageCount - 1)));
  }

  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <RotatingThinkerImage
          slug={thinkerSlug}
          name={thinkerName}
          desktopImages={desktopImages}
          mobileImages={mobileImages}
          captions={captions}
          imageIndex={pageIndex}
          layout="portrait"
          size={280}
          priority
        />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Life Story
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              Page {pageIndex + 1} / {pageCount}
            </p>
          </div>
          <h3 className="text-2xl font-semibold">{page.title}</h3>
          <p className="text-lg leading-8 text-[var(--color-text)]">{page.body}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {pages.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => goToPage(index)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              index === pageIndex
                ? "bg-[var(--color-accent)] text-[#101014]"
                : index < pageIndex
                  ? "bg-[var(--color-surface-raised)] text-[var(--color-text)]"
                  : "bg-[var(--color-surface)] text-[var(--color-muted)]"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {pageIndex > 0 && (
          <Button variant="secondary" onClick={() => goToPage(pageIndex - 1)}>
            Back
          </Button>
        )}
        {pageIndex < pageCount - 1 && (
          <Button onClick={() => goToPage(pageIndex + 1)}>Continue</Button>
        )}
      </div>
    </Card>
  );
}
