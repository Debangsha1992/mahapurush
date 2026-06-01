"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">Mind Journal</h2>
          <p className="mt-2 text-[var(--color-muted)]">
            Your private record of reflection and thought.
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          Export Journal
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-sm ${
            filter === "all"
              ? "bg-[var(--color-accent)] text-[#101014]"
              : "bg-[var(--color-surface-raised)] text-[var(--color-muted)]"
          }`}
        >
          All
        </button>
        {thinkers.map((thinkerId) => (
          <button
            key={thinkerId}
            type="button"
            onClick={() => setFilter(thinkerId)}
            className={`rounded-full px-4 py-2 text-sm capitalize ${
              filter === thinkerId
                ? "bg-[var(--color-accent)] text-[#101014]"
                : "bg-[var(--color-surface-raised)] text-[var(--color-muted)]"
            }`}
          >
            {thinkerId}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <Card>
          <p className="text-[var(--color-muted)]">
            No journal entries yet. Complete a lesson reflection to start your thinking timeline.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">
                  {entry.thinkerId}
                </p>
                <p className="text-sm text-[var(--color-muted)]">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-4 font-medium">{entry.prompt}</p>
              <p className="mt-3 leading-8 text-[var(--color-muted)]">{entry.response}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
