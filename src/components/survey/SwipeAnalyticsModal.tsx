import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    Modal,
    Pressable,
    ScrollView,
    SafeAreaView,
    StyleSheet,
    Image,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import type { StatementCard, Candidate } from "../../data/schema";
import type { CandidateMatchResult } from "../../services/matching";
import {
    computeGlobalAnalytics,
    computeCandidateCategoryBreakdown,
    computeCandidateTotals,
    type GlobalAnalytics,
    type CandidateHighlight,
    type CategorySentiment,
    type CandidateTotals,
} from "../../utils/computeSwipeAnalytics";
import { getCategoryTheme } from "../../utils/categoryTheme";
import { getCandidateImageSource } from "../../utils/candidateImageSource";

// ── Props ──────────────────────────────────────────────────────────

interface SwipeAnalyticsModalProps {
    visible: boolean;
    onClose: () => void;
    answers: Record<string, string>;
    cards: StatementCard[];
    candidates: Candidate[];
    ranking: CandidateMatchResult[];
}

// ── Main Component ─────────────────────────────────────────────────

export function SwipeAnalyticsModal({
    visible,
    onClose,
    answers,
    cards,
    candidates,
    ranking,
}: SwipeAnalyticsModalProps) {
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
        null
    );

    const analytics = useMemo(
        () => computeGlobalAnalytics(answers, cards, candidates, ranking),
        [answers, cards, candidates, ranking]
    );

    const selectedMatch = useMemo(
        () =>
            selectedCandidateId
                ? ranking.find((r) => r.candidateId === selectedCandidateId)
                : null,
        [selectedCandidateId, ranking]
    );

    const categoryBreakdown = useMemo(
        () =>
            selectedMatch
                ? computeCandidateCategoryBreakdown(selectedMatch, cards)
                : [],
        [selectedMatch, cards]
    );

    const candidateTotals = useMemo(
        () => (selectedMatch ? computeCandidateTotals(selectedMatch) : null),
        [selectedMatch]
    );

    const selectedCandidate = useMemo(
        () =>
            selectedCandidateId
                ? candidates.find((c) => c.id === selectedCandidateId)
                : null,
        [selectedCandidateId, candidates]
    );

    if (!visible) return null;

    const handleClose = () => {
        setSelectedCandidateId(null);
        onClose();
    };

    const handleBack = () => {
        setSelectedCandidateId(null);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    {selectedCandidateId ? (
                        <Pressable onPress={handleBack} style={styles.headerButton}>
                            <Ionicons name="chevron-back" size={22} color="#1A202C" />
                        </Pressable>
                    ) : (
                        <View style={styles.headerButton} />
                    )}
                    <Text style={styles.headerTitle}>
                        {selectedCandidateId ? selectedCandidate?.name ?? "" : "Tes Stats"}
                    </Text>
                    <Pressable onPress={handleClose} style={styles.headerButton}>
                        <Ionicons name="close" size={22} color="#1A202C" />
                    </Pressable>
                </View>

                {/* Content */}
                {selectedCandidateId && selectedCandidate ? (
                    <CandidateDrillDown
                        candidate={selectedCandidate}
                        breakdown={categoryBreakdown}
                        totals={candidateTotals!}
                        score={
                            ranking.find((r) => r.candidateId === selectedCandidateId)
                                ?.alignmentScore ?? 0
                        }
                    />
                ) : (
                    <GlobalStatsView
                        analytics={analytics}
                        candidates={candidates}
                        onCandidatePress={setSelectedCandidateId}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
}

// ── Screen 1: Global Stats ─────────────────────────────────────────

function GlobalStatsView({
    analytics,
    candidates,
    onCandidatePress,
}: {
    analytics: GlobalAnalytics;
    candidates: Candidate[];
    onCandidatePress: (id: string) => void;
}) {
    const { totalSwipes, breakdown, decisivenessScore } = analytics;
    const [isDecisivenessExpanded, setIsDecisivenessExpanded] = useState(false);

    const decisivenessEmoji =
        decisivenessScore >= 60 ? "🔥" : decisivenessScore >= 30 ? "💪" : "🤔";

    // Breakdown bar: left = most negative, right = most positive
    const total = totalSwipes || 1;
    const barSegments = [
        {
            key: "strongly_disagree",
            count: breakdown.strongly_disagree,
            color: "#991B1B",
            label: "Pas du tout d'accord",
        },
        {
            key: "disagree",
            count: breakdown.disagree,
            color: "#EF4444",
            label: "Pas d'accord",
        },
        {
            key: "skip",
            count: breakdown.skip,
            color: "#D1D5DB",
            label: "Pas d'avis",
        },
        {
            key: "agree",
            count: breakdown.agree,
            color: "#22C55E",
            label: "D'accord",
        },
        {
            key: "strongly_agree",
            count: breakdown.strongly_agree,
            color: "#166534",
            label: "Coup de cœur",
        },
    ].filter((s) => s.count > 0);

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Total Swipes */}
            <Animated.View
                entering={FadeInDown.delay(50).duration(400)}
                style={styles.statCard}
            >
                <Text style={styles.statEmoji}>🗳️</Text>
                <Text style={styles.statBigNumber}>{totalSwipes}</Text>
                <Text style={styles.statLabel}>propositions swipées</Text>
            </Animated.View>

            {/* Swipe Breakdown Bar */}
            <Animated.View
                entering={FadeInDown.delay(100).duration(400)}
                style={styles.statCard}
            >
                <Text style={styles.statSectionTitle}>Répartition des swipes</Text>
                <View style={styles.breakdownBar}>
                    {barSegments.map((seg) => (
                        <View
                            key={seg.key}
                            style={[
                                styles.breakdownSegment,
                                {
                                    backgroundColor: seg.color,
                                    flex: seg.count / total,
                                },
                            ]}
                        />
                    ))}
                </View>
                <View style={styles.breakdownLegend}>
                    {barSegments.map((seg) => (
                        <View key={seg.key} style={styles.legendItem}>
                            <View
                                style={[styles.legendDot, { backgroundColor: seg.color }]}
                            />
                            <Text style={styles.legendText}>
                                {seg.count} {seg.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </Animated.View>

            {/* Decisiveness — collapsible */}
            <Animated.View
                entering={FadeInDown.delay(150).duration(400)}
            >
                <Pressable
                    onPress={() => setIsDecisivenessExpanded(!isDecisivenessExpanded)}
                    style={styles.statCard}
                >
                    <View style={styles.decisivenessRow}>
                        <View style={{ flex: 1, marginRight: 16 }}>
                            <Text style={styles.statSectionTitle}>Indice de conviction</Text>
                        </View>
                        <View style={styles.decisivenessCircle}>
                            <Text style={styles.decisivenessEmoji}>{decisivenessEmoji}</Text>
                            <Text style={styles.decisivenessScore}>{decisivenessScore}%</Text>
                        </View>
                    </View>
                    {isDecisivenessExpanded && (
                        <Text style={styles.decisivenessExplainer}>
                            Plus tu utilises "coup de cœur" ou "pas du tout d'accord", plus ton indice monte. Les "je ne sais pas" font baisser ton score.
                        </Text>
                    )}
                    <View style={styles.expandHint}>
                        <Ionicons
                            name={isDecisivenessExpanded ? "chevron-up" : "chevron-down"}
                            size={16}
                            color="#9CA3AF"
                        />
                    </View>
                </Pressable>
            </Animated.View>

            {/* Candidate Hero Cards */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <Text
                    style={[
                        styles.statSectionTitle,
                        { marginBottom: 12, marginTop: 8 },
                    ]}
                >
                    Tes candidats
                </Text>

                {/* Top matches */}
                {analytics.topMatches.map((match) => (
                    <CandidateHeroCard
                        key={match.candidateId}
                        highlight={match}
                        label="🏆 Meilleur match"
                        candidates={candidates}
                        onPress={() => onCandidatePress(match.candidateId)}
                        accentColor="#22C55E"
                    />
                ))}

                {/* Least matches */}
                {analytics.leastMatches.map((match) => (
                    <CandidateHeroCard
                        key={match.candidateId}
                        highlight={match}
                        label="👎 Moins aligné"
                        candidates={candidates}
                        onPress={() => onCandidatePress(match.candidateId)}
                        accentColor="#EF4444"
                    />
                ))}
            </Animated.View>
        </ScrollView>
    );
}

// ── Candidate Hero Card ────────────────────────────────────────────

function CandidateHeroCard({
    highlight,
    label,
    candidates,
    onPress,
    accentColor,
}: {
    highlight: CandidateHighlight;
    label: string;
    candidates: Candidate[];
    onPress: () => void;
    accentColor: string;
}) {
    const candidate = candidates.find((c) => c.id === highlight.candidateId);
    const imageSource = candidate ? getCandidateImageSource(candidate) : null;

    return (
        <Pressable
            onPress={onPress}
            style={[styles.heroCard, { borderLeftColor: accentColor }]}
        >
            <View style={styles.heroCardContent}>
                {imageSource ? (
                    <Image
                        source={imageSource}
                        style={styles.heroAvatar}
                        accessibilityIgnoresInvertColors
                    />
                ) : (
                    <View style={[styles.heroAvatar, styles.heroAvatarPlaceholder]}>
                        <Text style={{ fontSize: 18 }}>👤</Text>
                    </View>
                )}
                <View style={styles.heroInfo}>
                    <Text style={styles.heroLabel}>{label}</Text>
                    <Text style={styles.heroName}>{highlight.name}</Text>
                    <Text style={styles.heroParty}>{highlight.party}</Text>
                </View>
                <View style={styles.heroScoreContainer}>
                    <Text
                        style={[
                            styles.heroScore,
                            { color: highlight.score >= 0 ? "#22C55E" : "#EF4444" },
                        ]}
                    >
                        {highlight.score > 0 ? `+${highlight.score}` : highlight.score} pts
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
            </View>
        </Pressable>
    );
}

// ── Screen 2: Candidate Drill-Down ─────────────────────────────────

function CandidateDrillDown({
    candidate,
    breakdown,
    totals,
    score,
}: {
    candidate: Candidate;
    breakdown: CategorySentiment[];
    totals: CandidateTotals;
    score: number;
}) {
    const imageSource = getCandidateImageSource(candidate);

    // Max for scaling category bars
    const maxVal = Math.max(
        ...breakdown.map((c) => c.agreeCount + c.disagreeCount),
        1
    );

    // Totals bar
    const totalBarMax = totals.totalAgree + totals.totalDisagree || 1;

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Candidate Header */}
            <Animated.View
                entering={FadeInDown.delay(50).duration(400)}
                style={styles.candidateHeader}
            >
                {imageSource ? (
                    <Image
                        source={imageSource}
                        style={styles.candidateAvatar}
                        accessibilityIgnoresInvertColors
                    />
                ) : (
                    <View
                        style={[styles.candidateAvatar, styles.heroAvatarPlaceholder]}
                    >
                        <Text style={{ fontSize: 28 }}>👤</Text>
                    </View>
                )}
                <Text style={styles.candidateParty}>{candidate.party}</Text>
                <Text
                    style={[
                        styles.candidateScore,
                        { color: score >= 0 ? "#22C55E" : "#EF4444" },
                    ]}
                >
                    {score > 0 ? `+${score}` : score} pts
                </Text>
            </Animated.View>

            {/* Global agree/disagree bar for this candidate */}
            <Animated.View
                entering={FadeInDown.delay(80).duration(400)}
                style={styles.statCard}
            >
                <Text style={styles.statSectionTitle}>Vue d'ensemble</Text>
                <View style={styles.totalBar}>
                    {totals.totalAgree > 0 && (
                        <View
                            style={[
                                styles.totalBarSegment,
                                styles.agreeBar,
                                { flex: totals.totalAgree / totalBarMax },
                            ]}
                        >
                            <Text style={styles.totalBarText}>+{totals.totalAgree}</Text>
                        </View>
                    )}
                    {totals.totalDisagree > 0 && (
                        <View
                            style={[
                                styles.totalBarSegment,
                                styles.disagreeBar,
                                { flex: totals.totalDisagree / totalBarMax },
                            ]}
                        >
                            <Text style={styles.totalBarText}>-{totals.totalDisagree}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.totalBarLegend}>
                    <View style={styles.legendItem}>
                        <View
                            style={[styles.legendDot, { backgroundColor: "#22C55E" }]}
                        />
                        <Text style={styles.legendText}>
                            {totals.totalAgree} pts d'accord
                        </Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View
                            style={[styles.legendDot, { backgroundColor: "#EF4444" }]}
                        />
                        <Text style={styles.legendText}>
                            {totals.totalDisagree} pts pas d'accord
                        </Text>
                    </View>
                </View>
            </Animated.View>

            {/* Category breakdown */}
            <Animated.View entering={FadeInDown.delay(120).duration(400)}>
                <Text style={[styles.statSectionTitle, { marginBottom: 16 }]}>
                    Alignement par thème
                </Text>

                {breakdown.length === 0 ? (
                    <Text style={styles.emptyText}>
                        Aucune interaction pour ce candidat.
                    </Text>
                ) : (
                    breakdown.map((cat, index) => {
                        const theme = getCategoryTheme(cat.category);
                        const barTotal = cat.agreeCount + cat.disagreeCount || 1;
                        return (
                            <Animated.View
                                key={cat.category}
                                entering={FadeInDown.delay(140 + index * 40).duration(350)}
                                style={styles.categoryRow}
                            >
                                <View style={styles.categoryLabelRow}>
                                    <Ionicons
                                        name={theme.icon as any}
                                        size={16}
                                        color={theme.bg}
                                    />
                                    <Text style={[styles.categoryName, { color: theme.bg }]}>
                                        {cat.category}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.categoryNet,
                                            { color: cat.net >= 0 ? "#22C55E" : "#EF4444" },
                                        ]}
                                    >
                                        {cat.net > 0 ? `+${cat.net}` : cat.net}
                                    </Text>
                                </View>
                                {/* Single-line dual bar: agree + disagree side by side */}
                                <View style={styles.categoryBarContainer}>
                                    {cat.agreeCount > 0 && (
                                        <View
                                            style={[
                                                styles.categoryBar,
                                                styles.agreeBar,
                                                { flex: cat.agreeCount / barTotal },
                                            ]}
                                        >
                                            <Text style={styles.barText}>+{cat.agreeCount}</Text>
                                        </View>
                                    )}
                                    {cat.disagreeCount > 0 && (
                                        <View
                                            style={[
                                                styles.categoryBar,
                                                styles.disagreeBar,
                                                { flex: cat.disagreeCount / barTotal },
                                            ]}
                                        >
                                            <Text style={styles.barText}>-{cat.disagreeCount}</Text>
                                        </View>
                                    )}
                                </View>
                            </Animated.View>
                        );
                    })
                )}
            </Animated.View>

            {/* Legend */}
            <Animated.View
                entering={FadeInDown.delay(300).duration(350)}
                style={styles.drillDownLegend}
            >
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />
                    <Text style={styles.legendText}>D'accord</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
                    <Text style={styles.legendText}>Pas d'accord</Text>
                </View>
            </Animated.View>
        </ScrollView>
    );
}

// ── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EEF2F7",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
    },
    headerButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 18,
        color: "#1A202C",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },

    // Stat Cards
    statCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    statEmoji: {
        fontSize: 28,
        marginBottom: 4,
    },
    statBigNumber: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 48,
        color: "#1A202C",
        lineHeight: 52,
    },
    statLabel: {
        fontFamily: "Inter_500Medium",
        fontSize: 14,
        color: "#6B7280",
        marginTop: 2,
    },
    statSectionTitle: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 15,
        color: "#1A202C",
        marginBottom: 12,
    },

    // Breakdown bar
    breakdownBar: {
        flexDirection: "row",
        height: 20,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 12,
    },
    breakdownSegment: {
        minWidth: 4,
    },
    breakdownLegend: {
        gap: 6,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontFamily: "Inter_400Regular",
        fontSize: 12,
        color: "#6B7280",
    },

    // Decisiveness
    decisivenessRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    decisivenessSubtitle: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 16,
        color: "#374151",
        marginTop: 2,
    },
    decisivenessDesc: {
        fontFamily: "Inter_400Regular",
        fontSize: 13,
        color: "#6B7280",
        lineHeight: 18,
        marginTop: 6,
    },
    decisivenessCircle: {
        alignItems: "center",
        justifyContent: "center",
    },
    decisivenessEmoji: {
        fontSize: 28,
    },
    decisivenessScore: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 20,
        color: "#1A202C",
        marginTop: 2,
    },
    decisivenessExplainer: {
        fontFamily: "Inter_400Regular",
        fontSize: 14,
        color: "#6B7280",
        marginTop: 10,
        lineHeight: 20,
    },

    // Hero cards
    heroCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    heroCardContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    heroAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    heroAvatarPlaceholder: {
        backgroundColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
    },
    heroInfo: {
        flex: 1,
    },
    heroLabel: {
        fontFamily: "Inter_500Medium",
        fontSize: 11,
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    heroName: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 16,
        color: "#1A202C",
    },
    heroParty: {
        fontFamily: "Inter_400Regular",
        fontSize: 12,
        color: "#6B7280",
    },
    heroScoreContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    heroScore: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 16,
    },

    // Candidate drill-down
    candidateHeader: {
        alignItems: "center",
        paddingVertical: 16,
        marginBottom: 8,
    },
    candidateAvatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        marginBottom: 10,
    },
    candidateParty: {
        fontFamily: "Inter_500Medium",
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 4,
    },
    candidateScore: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 24,
    },
    emptyText: {
        fontFamily: "Inter_400Regular",
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
        marginTop: 20,
    },

    // Total bar (global agree/disagree for candidate)
    totalBar: {
        flexDirection: "row",
        height: 28,
        borderRadius: 8,
        overflow: "hidden",
        gap: 3,
        marginBottom: 10,
    },
    totalBarSegment: {
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 36,
    },
    totalBarText: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 12,
        color: "#FFFFFF",
    },
    totalBarLegend: {
        flexDirection: "row",
        gap: 16,
    },

    // Category rows
    categoryRow: {
        marginBottom: 14,
    },
    categoryLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        gap: 6,
    },
    categoryName: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: 0.3,
        flex: 1,
    },
    categoryNet: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 13,
    },
    categoryBarContainer: {
        flexDirection: "row",
        height: 22,
        borderRadius: 6,
        overflow: "hidden",
        gap: 3,
    },
    categoryBar: {
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 28,
    },
    agreeBar: {
        backgroundColor: "#22C55E",
    },
    disagreeBar: {
        backgroundColor: "#EF4444",
    },
    barText: {
        fontFamily: "Inter_500Medium",
        fontSize: 10,
        color: "#FFFFFF",
    },
    drillDownLegend: {
        flexDirection: "row",
        gap: 16,
        justifyContent: "center",
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    expandHint: {
        alignItems: "center",
        marginTop: 8,
    },
});
