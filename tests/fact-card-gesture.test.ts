import { describe, expect, it } from "vitest";
import {
  FACT_CARD_GESTURE_THRESHOLD,
  getFactCardGestureIntent,
  getTouchGestureDelta,
} from "@/lib/content/fact-card-gesture";

describe("mobile fact card gestures", () => {
  it("replaces the current Fact for upward or downward scrolls beyond the threshold", () => {
    expect(
      getFactCardGestureIntent({
        deltaY: FACT_CARD_GESTURE_THRESHOLD,
      }),
    ).toBe("replace-fact");
    expect(
      getFactCardGestureIntent({
        deltaY: -FACT_CARD_GESTURE_THRESHOLD,
      }),
    ).toBe("replace-fact");
  });

  it("ignores small scrolls so reading the card does not accidentally replace the Fact", () => {
    expect(
      getFactCardGestureIntent({
        deltaY: FACT_CARD_GESTURE_THRESHOLD - 1,
      }),
    ).toBe("ignore");
    expect(
      getFactCardGestureIntent({
        deltaY: -(FACT_CARD_GESTURE_THRESHOLD - 1),
      }),
    ).toBe("ignore");
  });

  it("normalizes touch movement into a vertical delta", () => {
    expect(getTouchGestureDelta({ startY: 420, endY: 300 })).toBe(120);
    expect(getTouchGestureDelta({ startY: 300, endY: 420 })).toBe(-120);
  });
});
