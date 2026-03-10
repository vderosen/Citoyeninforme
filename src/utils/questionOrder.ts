interface DeriveEffectiveQuestionOrderParams {
  persistedOrder: string[];
  deterministicOrder: string[];
  availableCardIds: string[];
}

interface CardWithId {
  id: string;
}

interface FindNextUnansweredIndexParams<TCard extends CardWithId> {
  cards: TCard[];
  currentIndex: number;
  answers: Record<string, string>;
}

export function areStringArraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

export function deriveEffectiveQuestionOrder({
  persistedOrder,
  deterministicOrder,
  availableCardIds,
}: DeriveEffectiveQuestionOrderParams): string[] {
  const availableSet = new Set(availableCardIds);
  const seen = new Set<string>();
  const effectiveOrder: string[] = [];

  const addIfEligible = (cardId: string) => {
    if (!availableSet.has(cardId) || seen.has(cardId)) return;
    seen.add(cardId);
    effectiveOrder.push(cardId);
  };

  persistedOrder.forEach(addIfEligible);
  deterministicOrder.forEach(addIfEligible);
  availableCardIds.forEach(addIfEligible);

  return effectiveOrder;
}

export function findNextUnansweredIndex<TCard extends CardWithId>({
  cards,
  currentIndex,
  answers,
}: FindNextUnansweredIndexParams<TCard>): number {
  if (currentIndex < 0 || currentIndex >= cards.length) {
    return currentIndex;
  }

  let index = currentIndex;
  while (index < cards.length) {
    const cardId = cards[index]?.id;
    if (!cardId || answers[cardId] === undefined) {
      return index;
    }
    index += 1;
  }

  return index;
}
