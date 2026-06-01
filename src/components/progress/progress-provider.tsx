"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/lib/progress/store";
import { LocalStorageBanner } from "@/components/progress/local-storage-banner";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const setHydrated = useProgressStore((state) => state.setHydrated);

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  return (
    <>
      <LocalStorageBanner />
      {children}
    </>
  );
}
