import { describe, expect, it } from "vitest";
import { PERSON_DOMAINS } from "@/lib/constants/person-domains";
import { PERSON_REGIONS } from "@/lib/constants/person-regions";
import {
  getAllFacts,
  getAllPeople,
  getFactForDate,
  getFactBatch,
  getFeaturedPeople,
  getPeoplePage,
  validateAllContent,
} from "@/lib/content/loaders";

describe("people and facts content", () => {
  it("loads a published people library with featured records and verified facts", () => {
    const people = getAllPeople();
    const facts = getAllFacts();
    const featured = getFeaturedPeople();
    const domainIds = new Set(PERSON_DOMAINS.map((domain) => domain.id));
    const regionIds = new Set(PERSON_REGIONS.map((region) => region.id));

    expect(people.length).toBeGreaterThanOrEqual(1000);
    expect(featured.length).toBeGreaterThanOrEqual(500);
    expect(facts.length).toBeGreaterThanOrEqual(people.length);
    expect(people.every((person) => person.reviewStatus === "published")).toBe(true);
    expect(
      people.every((person) =>
        person.facts.some((fact) => fact.verified),
      ),
    ).toBe(true);
    expect(people.every((person) => domainIds.has(person.primaryDomain))).toBe(true);
    expect(people.every((person) => regionIds.has(person.regionId))).toBe(true);

    const featuredRanks = featured
      .map((person) => person.featuredRank)
      .filter((rank): rank is number => typeof rank === "number");
    expect(featuredRanks.length).toBe(featured.length);
    expect(featuredRanks.every((rank) => Number.isInteger(rank) && rank > 0)).toBe(
      true,
    );
    expect(new Set(featuredRanks).size).toBe(featuredRanks.length);
  });

  it("returns a deterministic fact for a given date", () => {
    const date = new Date("2026-07-05T00:00:00.000Z");

    expect(getFactForDate(date).id).toBe(getFactForDate(date).id);
  });

  it("returns bounded people summaries without facts", () => {
    const result = getPeoplePage({ page: 1, pageSize: 999 });

    expect(result.people.length).toBeLessThanOrEqual(48);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(48);
    expect(result.total).toBeGreaterThanOrEqual(1000);
    expect(result.people[0]).not.toHaveProperty("facts");
  });

  it("supports search and controlled taxonomy filters", () => {
    const result = getPeoplePage({
      query: "einstein",
      primaryDomain: "science-math-technology",
      page: 1,
      pageSize: 24,
    });

    expect(result.people.some((person) => person.slug === "einstein")).toBe(true);
    expect(
      result.people.every(
        (person) => person.primaryDomain === "science-math-technology",
      ),
    ).toBe(true);
  });

  it("returns bounded fact batches for Facts Mode", () => {
    const facts = getFactBatch({ seed: "test-seed", limit: 200 });

    expect(facts.length).toBeLessThanOrEqual(20);
    expect(facts.every((fact) => fact.verified)).toBe(true);
  });

  it("spreads fact batches across the full library instead of returning adjacent slices", () => {
    const allFacts = getAllFacts().filter((fact) => fact.verified);
    const indexById = new Map(allFacts.map((fact, index) => [fact.id, index]));
    const indexes = getFactBatch({ seed: "distributed-seed", limit: 20 }).map(
      (fact) => indexById.get(fact.id),
    );

    expect(indexes.every((index) => typeof index === "number")).toBe(true);
    expect(
      indexes.every((index, position) => {
        if (position === 0 || typeof index !== "number") {
          return true;
        }
        const previous = indexes[position - 1];
        return typeof previous === "number" && index === previous + 1;
      }),
    ).toBe(false);
  });

  it("excludes the current client batch when loading a new facts batch", () => {
    const firstBatch = getFactBatch({ seed: "same-seed", limit: 20 });
    const secondBatch = getFactBatch({
      seed: "same-seed",
      limit: 20,
      excludeIds: firstBatch.map((fact) => fact.id),
    });
    const firstBatchIds = new Set(firstBatch.map((fact) => fact.id));

    expect(secondBatch).toHaveLength(20);
    expect(secondBatch.every((fact) => !firstBatchIds.has(fact.id))).toBe(true);
  });

  it("validates people, facts, and cross-content references", () => {
    expect(() => validateAllContent()).not.toThrow();
  });
});
