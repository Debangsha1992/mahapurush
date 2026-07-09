"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EditorialCard,
  EditorialPageHero,
  editorialEyebrow,
  mutedText,
} from "@/components/ui/editorial";
import { exportJournal, useProgressStore } from "@/lib/progress/store";

export function JournalView() {
  const progress = useProgressStore((state) => state.progress);
  const hydrated = useProgressStore((state) => state.hydrated);
  const [filter, setFilter] = useState<string>("all");

  const entries = useMemo(() => {
    if (filter === "all") {
      return progress.journalEntries;
    }
    return progress.journalEntries.filter((entry) => entry.thinkerId === filter);
  }, [filter, progress.journalEntries]);

  const thinkers = [...new Set(progress.journalEntries.map((entry) => entry.thinkerId))];

  function handleExport() {
    const content = exportJournal(progress);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mindspark-journal.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!hydrated) {
    return <p className="text-[var(--color-muted)]">Loading journal...</p>;
  }

  return (
    <div className="space-y-6">
      <EditorialPageHero
        eyebrow="Journal"
        title="Mind Journal"
        description="Your private record of reflection and thought."
      >
        <Button variant="secondary" onClick={handleExport}>
          Export Journal
        </Button>
      </EditorialPageHero>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] ${
            filter === "all"
              ? "border-[var(--color-accent)] bg-yellow-400/10 text-[var(--color-accent)]"
              : "border-white/10 bg-white/[0.04] text-foreground/60"
          }`}
        >
          All
        </button>
        {thinkers.map((thinkerId) => (
          <button
            key={thinkerId}
            type="button"
            onClick={() => setFilter(thinkerId)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] ${
              filter === thinkerId
                ? "border-[var(--color-accent)] bg-yellow-400/10 text-[var(--color-accent)]"
                : "border-white/10 bg-white/[0.04] text-foreground/60"
            }`}
          >
            {thinkerId}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <EditorialCard>
          <p className={mutedText}>
            No journal entries yet. Complete a lesson reflection to start your thinking timeline.
          </p>
        </EditorialCard>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <EditorialCard key={entry.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={editorialEyebrow}>
                  {entry.thinkerId}
                </p>
                <p className={`text-sm ${mutedText}`}>
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-4 font-medium">{entry.prompt}</p>
              <p className={`mt-3 leading-8 ${mutedText}`}>{entry.response}</p>
            </EditorialCard>
          ))}
        </div>
      )}
    </div>
  );
}
