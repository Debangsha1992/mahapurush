"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JournalEntry, Progress } from "@/lib/content/schemas";
import { progressSchema } from "@/lib/content/schemas";
import {
  completeLesson,
  createInitialProgress,
  getTodayDateString,
} from "@/lib/gamification/engine";

const STORAGE_KEY = "mindspark_progress_v1";

interface ProgressState {
  progress: Progress;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  completeOnboarding: (pathId: string) => void;
  saveLessonStep: (lessonId: string, stepIndex: number) => void;
  addJournalEntry: (entry: JournalEntry) => void;
  finishLesson: (
    lessonId: string,
    layer: Parameters<typeof completeLesson>[2],
  ) => void;
  saveQuote: (quoteId: string) => void;
  completeWeeklyChallenge: (challengeId: string) => void;
  resetProgress: () => void;
}

function parseProgress(value: unknown): Progress {
  const parsed = progressSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }
  return createInitialProgress();
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
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
      finishLesson: (lessonId, layer) =>
        set((state) => ({
          progress: completeLesson(
            state.progress,
            lessonId,
            layer,
            getTodayDateString(),
          ),
        })),
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
              xp: state.progress.xp + 25,
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
          progress: parseProgress(persisted?.progress),
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
