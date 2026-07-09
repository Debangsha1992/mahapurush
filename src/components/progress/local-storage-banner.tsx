"use client";

import { useState } from "react";

export function LocalStorageBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="mb-6 rounded-[var(--radius-card)] border border-white/10 bg-[#0b0b0f] px-4 py-3 text-sm text-[var(--color-muted)] ring-1 ring-white/5">
      <div className="flex items-start justify-between gap-4">
        <p>
          Your progress and journal are saved only on this device. You can export
          your journal anytime from the Journal page.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[var(--color-text)] hover:border-[var(--color-accent)]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
