import { describe, expect, it } from "vitest";
import {
  calculateLessonXp,
  completeLesson,
  createInitialProgress,
  isLessonUnlocked,
  updateStreak,
} from "@/lib/gamification/engine";

describe("gamification engine", () => {
  it("calculates lesson xp with reflection and tension bonuses", () => {
    expect(
      calculateLessonXp({
        baseXp: 20,
        reflectionSubmitted: true,
        thoughtTensionSubmitted: true,
      }),
    ).toBe(35);
  });

  it("updates streak on consecutive days", () => {
    const next = updateStreak(
      { current: 2, longest: 2, lastActiveDate: "2026-05-31" },
      "2026-06-01",
    );

    expect(next.current).toBe(3);
    expect(next.longest).toBe(3);
  });

  it("resets streak after a missed day", () => {
    const next = updateStreak(
      { current: 4, longest: 4, lastActiveDate: "2026-05-29" },
      "2026-06-01",
    );

    expect(next.current).toBe(1);
  });

  it("completes a lesson once", () => {
    const initial = createInitialProgress();
    const layer = {
      hook: "hook",
      story: "story",
      bigIdea: { title: "Big", explanation: "Explain" },
      thinkingTool: { name: "Tool", instruction: "Use it" },
      modernTest: {
        scenario: "Scenario",
        question: "Question",
        options: [
          { id: "a", label: "A", explanation: "A" },
          { id: "b", label: "B", explanation: "B" },
        ],
        discussionNotes: "Notes",
      },
      reflectionPrompt: "Reflect",
      thoughtTension: {
        counterView: "Counter",
        responsePrompt: "Respond",
      },
      rewards: {
        xp: 20,
        badge: "questioner" as const,
        skills: [{ id: "questioning" as const, points: 2 }],
      },
    };

    const once = completeLesson(initial, "socrates-01", layer, "2026-06-01");
    const twice = completeLesson(once, "socrates-01", layer, "2026-06-01");

    expect(once.completedLessons).toEqual(["socrates-01"]);
    expect(twice.completedLessons).toEqual(["socrates-01"]);
    expect(twice.xp).toBe(once.xp);
  });

  it("unlocks the next lesson after completion", () => {
    const progress = {
      ...createInitialProgress(),
      completedLessons: ["socrates-01"],
    };

    expect(
      isLessonUnlocked(progress, 2, "socrates", [
        { id: "socrates-01", order: 1, thinkerId: "socrates" },
        { id: "socrates-02", order: 2, thinkerId: "socrates" },
      ]),
    ).toBe(true);
  });
});
