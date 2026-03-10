import {
  areStringArraysEqual,
  deriveEffectiveQuestionOrder,
  findNextUnansweredIndex,
} from "../../src/utils/questionOrder";

describe("question order utilities", () => {
  test("keeps in-progress run order stable across day-to-day deterministic reshuffles", () => {
    const dayNOrder = ["CARD_A", "CARD_B", "CARD_C", "CARD_D"];
    const dayNPlus1DeterministicOrder = ["CARD_D", "CARD_C", "CARD_B", "CARD_A"];

    const effectiveOrder = deriveEffectiveQuestionOrder({
      persistedOrder: dayNOrder,
      deterministicOrder: dayNPlus1DeterministicOrder,
      availableCardIds: ["CARD_A", "CARD_B", "CARD_C", "CARD_D"],
    });

    expect(effectiveOrder).toEqual(dayNOrder);
  });

  test("keeps persisted IDs that still exist and appends new ones from deterministic order", () => {
    const order = deriveEffectiveQuestionOrder({
      persistedOrder: ["CARD_A", "CARD_C", "CARD_OLD"],
      deterministicOrder: ["CARD_B", "CARD_A", "CARD_D", "CARD_C"],
      availableCardIds: ["CARD_A", "CARD_B", "CARD_C", "CARD_D"],
    });

    expect(order).toEqual(["CARD_A", "CARD_C", "CARD_B", "CARD_D"]);
  });

  test("falls back to available IDs if deterministic order misses a card", () => {
    const order = deriveEffectiveQuestionOrder({
      persistedOrder: [],
      deterministicOrder: ["CARD_B", "CARD_A"],
      availableCardIds: ["CARD_A", "CARD_B", "CARD_C"],
    });

    expect(order).toEqual(["CARD_B", "CARD_A", "CARD_C"]);
  });

  test("finds the next unanswered index from the current position", () => {
    const cards = [{ id: "CARD_A" }, { id: "CARD_B" }, { id: "CARD_C" }];
    const nextIndex = findNextUnansweredIndex({
      cards,
      currentIndex: 0,
      answers: {
        CARD_A: "CARD_A-agree",
        CARD_B: "CARD_B-agree",
      },
    });

    expect(nextIndex).toBe(2);
  });

  test("skips already-answered cards when resuming at a stale index", () => {
    const cards = [{ id: "CARD_A" }, { id: "CARD_B" }, { id: "CARD_C" }, { id: "CARD_D" }];
    const nextIndex = findNextUnansweredIndex({
      cards,
      currentIndex: 1,
      answers: {
        CARD_A: "CARD_A-agree",
        CARD_B: "CARD_B-agree",
      },
    });

    expect(nextIndex).toBe(2);
  });

  test("returns current index when card is unanswered", () => {
    const cards = [{ id: "CARD_A" }, { id: "CARD_B" }];
    const nextIndex = findNextUnansweredIndex({
      cards,
      currentIndex: 1,
      answers: {
        CARD_A: "CARD_A-agree",
      },
    });

    expect(nextIndex).toBe(1);
  });

  test("compares string arrays in order-sensitive way", () => {
    expect(areStringArraysEqual(["A", "B"], ["A", "B"])).toBe(true);
    expect(areStringArraysEqual(["A", "B"], ["B", "A"])).toBe(false);
  });
});
