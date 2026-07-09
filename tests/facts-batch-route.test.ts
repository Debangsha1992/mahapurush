import { describe, expect, it } from "vitest";
import { parseFactBatchQuery } from "@/app/api/facts/batch/route";

describe("facts batch route", () => {
  it("bounds query parameters before passing them into fact selection", () => {
    const params = new URLSearchParams({
      seed: "x".repeat(10_000),
      limit: "9999",
      exclude: Array.from({ length: 100 }, (_, index) =>
        `${"fact-id".repeat(50)}-${index}`,
      ).join(","),
    });

    const parsed = parseFactBatchQuery(params);

    expect(parsed.seed).toHaveLength(128);
    expect(parsed.limit).toBe(20);
    expect(parsed.excludeIds).toHaveLength(20);
    expect(parsed.excludeIds.every((id) => id.length <= 128)).toBe(true);
  });
});
