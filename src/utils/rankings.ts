import type { CandidateMatchResult } from "../services/matching";

export interface PodiumSlot {
    match: CandidateMatchResult;
    rank: number;
    label: string;
    height: number;
}

const rankToHeight: Record<number, number> = { 1: 150, 2: 110, 3: 80 };

/**
 * Takes the raw ranking and resolves ties, returning the slots for the podium
 * in visual order: [2nd (left), 1st (center), 3rd (right)]
 */
export function resolvePodiumTies(ranking: CandidateMatchResult[]): PodiumSlot[] {
    if (ranking.length < 3) return [];

    const top3 = ranking.slice(0, 3);
    const ranks: number[] = [];
    let currentRank = 1;

    for (let i = 0; i < top3.length; i++) {
        if (i > 0 && top3[i].alignmentScore === top3[i - 1].alignmentScore) {
            ranks.push(ranks[i - 1]);
        } else {
            ranks.push(currentRank);
        }
        currentRank = i + 2;
    }

    // Podium visual order: [position-1 (left), position-0 (center), position-2 (right)]
    return [
        { match: top3[1], rank: ranks[1], label: `#${ranks[1]}`, height: rankToHeight[ranks[1]] ?? 80 },
        { match: top3[0], rank: ranks[0], label: `#${ranks[0]}`, height: rankToHeight[ranks[0]] ?? 150 },
        { match: top3[2], rank: ranks[2], label: `#${ranks[2]}`, height: rankToHeight[ranks[2]] ?? 80 },
    ];
}
