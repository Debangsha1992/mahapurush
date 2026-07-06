type ChooseNextFactInput = {
  remainingIndexes: number[];
  randomValue?: number;
};

type ShowFactResult = {
  type: "show-fact";
  nextIndex: number;
  remainingIndexes: number[];
};

type LoadNextBatchResult = {
  type: "load-next-batch";
};

export type ChooseNextFactResult = ShowFactResult | LoadNextBatchResult;

export function chooseNextFact({
  remainingIndexes,
  randomValue = Math.random(),
}: ChooseNextFactInput): ChooseNextFactResult {
  if (remainingIndexes.length === 0) {
    return { type: "load-next-batch" };
  }

  const boundedRandom = Math.min(Math.max(randomValue, 0), 0.999999999);
  const nextIndex =
    remainingIndexes[Math.floor(boundedRandom * remainingIndexes.length)];

  return {
    type: "show-fact",
    nextIndex,
    remainingIndexes: remainingIndexes.filter((index) => index !== nextIndex),
  };
}
