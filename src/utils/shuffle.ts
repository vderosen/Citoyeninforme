/**
 * Deterministic shuffle using a seeded PRNG (FR-005).
 * Same seed always produces the same order — never editorial.
 */

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function deterministicShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  const random = seededRandom(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Candidate-coverage balanced shuffle.
 *
 * Orders cards so that at ANY stopping point, every candidate has had
 * roughly equal exposure. A card with candidateIds [A, B] counts as
 * coverage for BOTH A and B equally.
 *
 * Algorithm: greedy scheduler — always pick the next card that helps
 * the most underrepresented candidate(s). Ties are broken randomly
 * via the deterministic seed.
 */
export function balancedShuffle<T extends { candidateIds: string[] }>(
  cards: T[],
  seed: number
): T[] {
  const random = seededRandom(seed);

  // Collect all unique candidate IDs
  const allCandidates = new Set<string>();
  for (const card of cards) {
    for (const cid of card.candidateIds) allCandidates.add(cid);
  }

  // Track how many times each candidate has appeared so far
  const coverage = new Map<string, number>();
  for (const cid of allCandidates) coverage.set(cid, 0);

  // Work from a shuffled copy so ties are broken randomly
  const pool = [...cards];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const result: T[] = [];
  const used = new Set<number>();

  while (result.length < cards.length) {
    // Find the candidate with the lowest coverage
    let minCoverage = Infinity;
    for (const count of coverage.values()) {
      if (count < minCoverage) minCoverage = count;
    }

    // Find candidates at that minimum coverage level
    const hungryCandidates = new Set<string>();
    for (const [cid, count] of coverage) {
      if (count === minCoverage) hungryCandidates.add(cid);
    }

    // Find the best card: one that covers at least one hungry candidate
    // Among those, prefer cards that cover MORE hungry candidates
    let bestIdx = -1;
    let bestHungryHits = 0;

    for (let i = 0; i < pool.length; i++) {
      if (used.has(i)) continue;
      const card = pool[i];
      let hungryHits = 0;
      for (const cid of card.candidateIds) {
        if (hungryCandidates.has(cid)) hungryHits++;
      }
      if (hungryHits > bestHungryHits) {
        bestHungryHits = hungryHits;
        bestIdx = i;
      }
    }

    // If no card covers a hungry candidate (shouldn't happen), just take the next unused
    if (bestIdx === -1) {
      for (let i = 0; i < pool.length; i++) {
        if (!used.has(i)) { bestIdx = i; break; }
      }
    }

    const chosen = pool[bestIdx];
    used.add(bestIdx);
    result.push(chosen);

    // Update coverage for ALL candidates on this card
    for (const cid of chosen.candidateIds) {
      coverage.set(cid, (coverage.get(cid) ?? 0) + 1);
    }
  }

  return result;
}

export function dailySeed(): number {
  const today = new Date();
  return (
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  );
}
