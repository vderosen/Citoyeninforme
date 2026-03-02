/**
 * Swipe Analytics Utility
 *
 * Computes fun, gamified statistics from the user's swipe session.
 */

import type { StatementCard, Candidate } from "../data/schema";
import type { CandidateMatchResult } from "../services/matching";
import { extractAnswerSuffix, getAnswerMeta } from "./swipeAnswer";

// ── Types ──────────────────────────────────────────────────────────

export interface SwipeBreakdown {
    agree: number;
    disagree: number;
    strongly_agree: number;
    strongly_disagree: number;
    skip: number;
}

export interface CandidateHighlight {
    candidateId: string;
    name: string;
    party: string;
    score: number;
    partyColor?: string;
}

export interface CategorySentiment {
    category: string;
    agreeCount: number;
    disagreeCount: number;
    net: number; // positive = agree-leaning, negative = disagree-leaning
}

export interface CandidateTotals {
    totalAgree: number;
    totalDisagree: number;
    net: number;
}

export interface GlobalAnalytics {
    totalSwipes: number;
    breakdown: SwipeBreakdown;
    decisivenessScore: number; // 0–100
    topMatches: CandidateHighlight[]; // can have ties
    leastMatches: CandidateHighlight[]; // can have ties
}

// ── Global Analytics ───────────────────────────────────────────────

export function computeGlobalAnalytics(
    answers: Record<string, string>,
    cards: StatementCard[],
    candidates: Candidate[],
    ranking: CandidateMatchResult[]
): GlobalAnalytics {
    const entries = Object.entries(answers);
    const totalSwipes = entries.length;

    // Breakdown
    const breakdown: SwipeBreakdown = {
        agree: 0,
        disagree: 0,
        strongly_agree: 0,
        strongly_disagree: 0,
        skip: 0,
    };

    for (const [cardId, answerId] of entries) {
        const suffix = extractAnswerSuffix(cardId, answerId);
        const answerMeta = getAnswerMeta(suffix);

        if (answerMeta) {
            breakdown[answerMeta.breakdownKey]++;
        }
    }

    // Conviction index: x2 swipes = +3, normal = +1, skip = -1
    // Apply a square-root curve so the score rises fast and plateaus at the top
    const weightedTotal =
        (breakdown.strongly_agree + breakdown.strongly_disagree) * 3 +
        (breakdown.agree + breakdown.disagree) * 1 +
        breakdown.skip * -1;
    const maxPossible = totalSwipes * 3; // if every swipe was strong
    const linearRatio = maxPossible > 0
        ? Math.max(0, Math.min(1, weightedTotal / maxPossible))
        : 0;
    // sqrt curve: rises fast, plateaus at top
    const decisivenessScore = Math.round(Math.sqrt(linearRatio) * 100);

    // Top & least matches — handle ties
    const sortedRanking = [...ranking].sort(
        (a, b) => b.alignmentScore - a.alignmentScore
    );

    const topScore = sortedRanking[0]?.alignmentScore;
    const leastScore = sortedRanking[sortedRanking.length - 1]?.alignmentScore;

    const findCandidate = (id: string) =>
        candidates.find((c) => c.id === id);

    const toHighlight = (r: CandidateMatchResult): CandidateHighlight => {
        const c = findCandidate(r.candidateId);
        return {
            candidateId: r.candidateId,
            name: c?.name ?? "Inconnu",
            party: c?.party ?? "",
            score: r.alignmentScore,
            partyColor: c?.partyColor,
        };
    };

    const topMatches = sortedRanking
        .filter((r) => r.alignmentScore === topScore)
        .map(toHighlight);

    const leastMatches = sortedRanking
        .filter((r) => r.alignmentScore === leastScore)
        .map(toHighlight);

    return {
        totalSwipes,
        breakdown,
        decisivenessScore,
        topMatches,
        leastMatches,
    };
}

// ── Per-Candidate Category Breakdown ───────────────────────────────

export function computeCandidateCategoryBreakdown(
    candidateMatch: CandidateMatchResult,
    cards: StatementCard[]
): CategorySentiment[] {
    const categoryMap: Record<
        string,
        { displayName: string; agreeCount: number; disagreeCount: number }
    > = {};

    for (const interaction of candidateMatch.cardBreakdown) {
        const card = cards.find((c) => c.id === interaction.cardId);
        const rawCategory = card?.category ?? "Autre";
        const key = rawCategory.toLowerCase().trim();

        if (!categoryMap[key]) {
            categoryMap[key] = { displayName: rawCategory.trim(), agreeCount: 0, disagreeCount: 0 };
        }

        if (interaction.pointsAwarded > 0) {
            categoryMap[key].agreeCount += interaction.pointsAwarded;
        } else if (interaction.pointsAwarded < 0) {
            categoryMap[key].disagreeCount += Math.abs(
                interaction.pointsAwarded
            );
        }
    }

    const result: CategorySentiment[] = Object.entries(categoryMap).map(
        ([_, counts]) => ({
            category: counts.displayName,
            agreeCount: counts.agreeCount,
            disagreeCount: counts.disagreeCount,
            net: counts.agreeCount - counts.disagreeCount,
        })
    );

    // Sort by absolute net (strongest sentiment first)
    result.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

    return result;
}

// ── Per-Candidate Totals ───────────────────────────────────────────

export function computeCandidateTotals(
    candidateMatch: CandidateMatchResult
): CandidateTotals {
    let totalAgree = 0;
    let totalDisagree = 0;

    for (const interaction of candidateMatch.cardBreakdown) {
        if (interaction.pointsAwarded > 0) {
            totalAgree += interaction.pointsAwarded;
        } else if (interaction.pointsAwarded < 0) {
            totalDisagree += Math.abs(interaction.pointsAwarded);
        }
    }

    return { totalAgree, totalDisagree, net: totalAgree - totalDisagree };
}
