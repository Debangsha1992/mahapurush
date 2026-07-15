"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BadgeId } from "@/lib/constants/badges";
import type { JournalEntry, Progress } from "@/lib/content/schemas";
import {
  completeLesson,
  createInitialProgress,
  getLocalDateString,
  recordDailyOpen as recordDailyOpenProgress,
} from "@/lib/gamification/engine";
import { migrateProgress } from "@/lib/progress/migrate";

const STORAGE_KEY = "mindspark_progress_v1";
const SESSION_ID_KEY = "mindspark_session_id_v1";
const SESSION_STARTED_AT_KEY = "mindspark_session_started_at_v1";

interface ProgressState {
  progress: Progress;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  completeOnboarding: (pathId: string) => void;
  recordDailyOpen: () => BadgeId[];
  saveLessonStep: (lessonId: string, stepIndex: number) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  finishLesson: (
    lessonId: string,
    layer: Parameters<typeof completeLesson>[2],
  ) => BadgeId[];
  saveQuote: (quoteId: string) => void;
  completeWeeklyChallenge: (challengeId: string) => void;
  resetProgress: () => void;
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getSessionInfo(): { id: string | null; startedAt: string | null } {
  if (typeof window === "undefined") {
    return { id: null, startedAt: null };
  }

  let id = window.sessionStorage.getItem(SESSION_ID_KEY);
  let startedAt = window.sessionStorage.getItem(SESSION_STARTED_AT_KEY);

  if (!id || !startedAt) {
    id = createSessionId();
    startedAt = new Date().toISOString();
    window.sessionStorage.setItem(SESSION_ID_KEY, id);
    window.sessionStorage.setItem(SESSION_STARTED_AT_KEY, startedAt);
  }

  return { id, startedAt };
}

function getNewBadgeIds(before: Progress, after: Progress): BadgeId[] {
  const beforeBadges = new Set(before.badges);
  return after.badges.filter((badge) => !beforeBadges.has(badge));
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      progress: createInitialProgress(),
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      completeOnboarding: (pathId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            onboardingComplete: true,
            selectedPathId: pathId,
          },
        })),
      recordDailyOpen: () => {
        let earnedBadges: BadgeId[] = [];
        const activityDate = getLocalDateString();
        const session = getSessionInfo();

        set((state) => {
          const nextProgress = recordDailyOpenProgress(
            state.progress,
            activityDate,
            session.id,
            session.startedAt,
          );
          earnedBadges = getNewBadgeIds(state.progress, nextProgress);
          return { progress: nextProgress };
        });

        return earnedBadges;
      },
      saveLessonStep: (lessonId, stepIndex) =>
        set((state) => ({
          progress: {
            ...state.progress,
            lessonSteps: {
              ...state.progress.lessonSteps,
              [lessonId]: stepIndex,
            },
          },
        })),
      addJournalEntry: (entry) =>
        set((state) => ({
          progress: {
            ...state.progress,
            journalEntries: [entry, ...state.progress.journalEntries],
          },
        })),
      finishLesson: (lessonId, layer) => {
        let earnedBadges: BadgeId[] = [];
        const activityDate = getLocalDateString();
        const session = getSessionInfo();

        set((state) => {
          const nextProgress = completeLesson(
            state.progress,
            lessonId,
            layer,
            activityDate,
            session.id,
            session.startedAt,
          );
          earnedBadges = getNewBadgeIds(state.progress, nextProgress);
          return { progress: nextProgress };
        });

        return earnedBadges;
      },
      saveQuote: (quoteId) =>
        set((state) => {
          if (state.progress.savedQuotes.includes(quoteId)) {
            return state;
          }
          return {
            progress: {
              ...state.progress,
              savedQuotes: [...state.progress.savedQuotes, quoteId],
            },
          };
        }),
      completeWeeklyChallenge: (challengeId) =>
        set((state) => {
          if (state.progress.completedWeeklyChallenges.includes(challengeId)) {
            return state;
          }
          return {
            progress: {
              ...state.progress,
              completedWeeklyChallenges: [
                ...state.progress.completedWeeklyChallenges,
                challengeId,
              ],
            },
          };
        }),
      resetProgress: () => set({ progress: createInitialProgress() }),
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ProgressState> | undefined;
        return {
          ...currentState,
          ...persisted,
          progress: migrateProgress(persisted?.progress),
        };
      },
    },
  ),
);

export function exportJournal(progress: Progress): string {
  return progress.journalEntries
    .map(
      (entry) =>
        `[${entry.createdAt}] ${entry.thinkerId} / ${entry.lessonId}\nPrompt: ${entry.prompt}\nResponse: ${entry.response}\n`,
    )
    .join("\n---\n\n");
}
