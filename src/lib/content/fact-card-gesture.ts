export const FACT_CARD_GESTURE_THRESHOLD = 72;

type FactCardGestureIntentInput = {
  deltaY: number;
  threshold?: number;
};

export type FactCardGestureIntent = "replace-fact" | "ignore";

export function getFactCardGestureIntent({
  deltaY,
  threshold = FACT_CARD_GESTURE_THRESHOLD,
}: FactCardGestureIntentInput): FactCardGestureIntent {
  return Math.abs(deltaY) >= threshold ? "replace-fact" : "ignore";
}

export function getTouchGestureDelta({
  startY,
  endY,
}: {
  startY: number;
  endY: number;
}): number {
  return startY - endY;
}
