import { describe, expect, it } from "vitest";
import {
  completeLesson,
  createInitialProgress,
  getStreakTier,
  isLessonUnlocked,
  recordDailyOpen,
  updateStreak,
} from "@/lib/gamification/engine";
import { migrateProgress } from "@/lib/progress/migrate";

function createTestLayer(): Parameters<typeof completeLesson>[2] {
  return {
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
      badge: "questioner",
      skills: [{ id: "questioning", points: 2 }],
    },
  };
}

describe("gamification engine", () => {
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

  it("records app opens once per local day", () => {
    const initial = createInitialProgress();
    const firstOpen = recordDailyOpen(
      initial,
      "2026-06-01",
      "session-1",
      "2026-06-01T08:00:00.000Z",
    );
    const sameDayOpen = recordDailyOpen(
      firstOpen,
      "2026-06-01",
      "session-1",
      "2026-06-01T08:00:00.000Z",
    );
    const nextDayOpen = recordDailyOpen(
      sameDayOpen,
      "2026-06-02",
      "session-1",
      "2026-06-01T08:00:00.000Z",
    );

    expect(firstOpen.streak.current).toBe(1);
    expect(sameDayOpen.streak.current).toBe(1);
    expect(nextDayOpen.streak.current).toBe(2);
    expect(nextDayOpen.dailyActivity.openedDates).toEqual([
      "2026-06-01",
      "2026-06-02",
    ]);
  });

  it("resets app-open streak after a missed local day", () => {
    const progress = {
      ...createInitialProgress(),
      streak: { current: 4, longest: 4, lastActiveDate: "2026-06-01" },
      dailyActivity: {
        lastOpenedDate: "2026-06-01",
        openedDates: ["2026-06-01"],
        lessonCompletionsByDate: {},
      },
    };

    const next = recordDailyOpen(
      progress,
      "2026-06-03",
      "session-1",
      "2026-06-03T08:00:00.000Z",
    );

    expect(next.streak.current).toBe(1);
    expect(next.streak.longest).toBe(4);
  });

  it("selects configured streak flame tiers", () => {
    expect(getStreakTier(4)).toBeNull();
    expect(getStreakTier(5)?.days).toBe(5);
    expect(getStreakTier(49)?.days).toBe(5);
    expect(getStreakTier(50)?.days).toBe(50);
    expect(getStreakTier(100)?.days).toBe(100);
    expect(getStreakTier(200)?.days).toBe(200);
    expect(getStreakTier(500)?.days).toBe(500);
    expect(getStreakTier(1000)?.days).toBe(1000);
  });

  it("completes a lesson once", () => {
    const initial = createInitialProgress();
    const layer = createTestLayer();

    const once = completeLesson(initial, "socrates-01", layer, "2026-06-01");
    const twice = completeLesson(once, "socrates-01", layer, "2026-06-01");

    expect(once.completedLessons).toEqual(["socrates-01"]);
    expect(twice.completedLessons).toEqual(["socrates-01"]);
    expect(twice.badges).toEqual(once.badges);
  });

  it("awards a badge for two completed lessons in one app session", () => {
    const layer = createTestLayer();
    const first = completeLesson(
      createInitialProgress(),
      "socrates-01",
      layer,
      "2026-06-01",
      "session-1",
      "2026-06-01T08:00:00.000Z",
    );
    const second = completeLesson(
      first,
      "socrates-02",
      layer,
      "2026-06-01",
      "session-1",
      "2026-06-01T08:00:00.000Z",
    );

    expect(second.session.completedLessonIds).toEqual([
      "socrates-01",
      "socrates-02",
    ]);
    expect(second.badges).toContain("two-lesson-session");
  });

  it("awards a badge for two lessons on every day of a five-day streak", () => {
    const layer = createTestLayer();
    let progress = createInitialProgress();

    for (let day = 1; day <= 5; day += 1) {
      const date = `2026-06-0${day}`;
      const sessionId = `session-${day}`;
      const startedAt = `${date}T08:00:00.000Z`;

      progress = recordDailyOpen(progress, date, sessionId, startedAt);
      progress = completeLesson(
        progress,
        `lesson-${day}-a`,
        layer,
        date,
        sessionId,
        startedAt,
      );
      progress = completeLesson(
        progress,
        `lesson-${day}-b`,
        layer,
        date,
        sessionId,
        startedAt,
      );
    }

    expect(progress.streak.current).toBe(5);
    expect(progress.badges).toContain("daily-double-lesson-streak");
  });

  it("migrates version 1 progress without clearing existing data", () => {
    const legacyProgress = {
      ...createInitialProgress(),
      version: 1,
      xp: 120,
      streak: { current: 5, longest: 5, lastActiveDate: "2026-06-05" },
      completedLessons: ["socrates-01"],
    } as Record<string, unknown>;
    delete legacyProgress.dailyActivity;
    delete legacyProgress.session;

    const migrated = migrateProgress(legacyProgress);

    expect(migrated.version).toBe(2);
    expect(migrated.completedLessons).toEqual(["socrates-01"]);
    expect(migrated.dailyActivity.lastOpenedDate).toBe("2026-06-05");
    expect(migrated.badges).toContain("streak-5");
    expect(migrated).not.toHaveProperty("xp");
  });

  it("strips legacy xp when migrating current progress", () => {
    const withXp = {
      ...createInitialProgress(),
      xp: 85,
    } as Record<string, unknown>;

    const migrated = migrateProgress(withXp);

    expect(migrated.version).toBe(2);
    expect(migrated).not.toHaveProperty("xp");
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
