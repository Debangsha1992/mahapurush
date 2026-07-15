"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useProgressStore } from "@/lib/progress/store";
import { LocalStorageBanner } from "@/components/progress/local-storage-banner";

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setHydrated = useProgressStore((state) => state.setHydrated);
  const recordDailyOpen = useProgressStore((state) => state.recordDailyOpen);
  const isHome = pathname === "/";

  useEffect(() => {
    setHydrated(true);
    recordDailyOpen();
  }, [recordDailyOpen, setHydrated]);

  return (
    <>
      {!isHome && <LocalStorageBanner />}
      {children}
    </>
  );
}
