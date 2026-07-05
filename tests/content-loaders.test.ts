import { describe, expect, it } from "vitest";
import {
  getAllFacts,
  getAllPeople,
  getFactForDate,
  validateAllContent,
} from "@/lib/content/loaders";

describe("people and facts content", () => {
  it("loads the starter notable people batch with verified facts", () => {
    const people = getAllPeople();
    const facts = getAllFacts();

    expect(people.length).toBeGreaterThanOrEqual(20);
    expect(people.length).toBeLessThanOrEqual(30);
    expect(facts.length).toBeGreaterThanOrEqual(people.length);
    expect(facts.every((fact) => fact.verified)).toBe(true);
  });

  it("returns a deterministic fact for a given date", () => {
    const date = new Date("2026-07-05T00:00:00.000Z");

    expect(getFactForDate(date).id).toBe(getFactForDate(date).id);
  });

  it("validates people, facts, and cross-content references", () => {
    expect(() => validateAllContent()).not.toThrow();
  });
});
