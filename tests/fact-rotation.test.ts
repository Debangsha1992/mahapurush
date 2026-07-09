import { describe, expect, it } from "vitest";
import { chooseNextFact } from "@/lib/content/fact-rotation";

describe("fact rotation", () => {
  it("selects an unseen fact and removes it from the remaining pool", () => {
    const result = chooseNextFact({
      remainingIndexes: [1, 2, 3],
      randomValue: 0.5,
    });

    expect(result).toEqual({
      type: "show-fact",
      nextIndex: 2,
      remainingIndexes: [1, 3],
    });
  });

  it("requests a new batch when the current batch is exhausted", () => {
    const result = chooseNextFact({
      remainingIndexes: [],
      randomValue: 0.5,
    });

    expect(result).toEqual({
      type: "load-next-batch",
    });
  });
});
