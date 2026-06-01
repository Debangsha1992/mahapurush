"use client";

import { useState } from "react";

export function LocalStorageBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-muted)]">
      <div className="flex items-start justify-between gap-4">
        <p>
          Your progress and journal are saved only on this device. You can export
          your journal anytime from the Journal page.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full px-3 py-1 text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
