import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useElectionStore } from "../../stores/election";
import {
    FIRST_SURVEY_ROUND,
    SECOND_SURVEY_ROUND,
    type SurveyRoundId,
    useSurveyStore,
} from "../../stores/survey";
import { useAppStore } from "../../stores/app";
import { AlignmentRanking } from "../../components/survey/AlignmentRanking";
import { Podium } from "../../components/survey/Podium";
import { FeedbackAction } from "../../components/shared/FeedbackAction";
import { usePodiumCelebrationTrigger } from "../../hooks/usePodiumCelebrationTrigger";
import { computeGlobalAnalytics } from "../../utils/computeSwipeAnalytics";
import { isEligibleForResultsReviewPrompt } from "../../utils/review-prompt";
import { openStoreListing, requestNativeStoreReview } from "../../services/store-review";
import {
    filterParisSecondRoundCandidateRanking,
    getParisSecondRoundCandidates,
    getParisSecondRoundStatementCards,
} from "../../data/elections/paris-2026/secondRoundSurvey";

export default function MatchesScreen() {
    const { t } = useTranslation("survey");
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const electionCandidates = useElectionStore((s) => s.candidates);
    const statementCards = useElectionStore((s) => s.statementCards);
    const rounds = useSurveyStore((s) => s.rounds);
    const reset = useSurveyStore((s) => s.reset);
    const markResultsTabVisited = useSurveyStore((s) => s.markResultsTabVisited);
    const hasSeenResultsRatingPrompt = useAppStore((s) => s.hasSeenResultsRatingPrompt);
    const markResultsRatingPromptSeen = useAppStore((s) => s.markResultsRatingPromptSeen);
    const [selectedRound, setSelectedRound] = useState<SurveyRoundId>(
        SECOND_SURVEY_ROUND
    );
    const [isConvictionExpanded, setIsConvictionExpanded] = useState(false);
    const [isRoundMenuVisible, setIsRoundMenuVisible] = useState(false);
    const secondRoundCandidates = useMemo(
        () => getParisSecondRoundCandidates(electionCandidates),
        [electionCandidates]
    );
    const secondRoundCards = useMemo(
        () => getParisSecondRoundStatementCards(statementCards),
        [statementCards]
    );

    const displayedRoundState = rounds[selectedRound];
    const secondRoundState = rounds[SECOND_SURVEY_ROUND];
    const profile = displayedRoundState.profile;
    const answers = displayedRoundState.answers;
    const baseRoundCandidates =
        displayedRoundState.candidatesSnapshot.length > 0
            ? displayedRoundState.candidatesSnapshot
            : selectedRound === SECOND_SURVEY_ROUND
                ? secondRoundCandidates
                : electionCandidates;
    const roundCandidates =
        selectedRound === SECOND_SURVEY_ROUND
            ? getParisSecondRoundCandidates(baseRoundCandidates)
            : baseRoundCandidates;
    const roundCards =
        selectedRound === SECOND_SURVEY_ROUND ? secondRoundCards : statementCards;
    const triggerCelebration = usePodiumCelebrationTrigger(profile, selectedRound);
    const candidateRanking = useMemo(() => {
        const ranking = profile?.candidateRanking ?? [];
        return selectedRound === SECOND_SURVEY_ROUND
            ? filterParisSecondRoundCandidateRanking(ranking)
            : ranking;
    }, [profile?.candidateRanking, selectedRound]);

    useFocusEffect(
        useCallback(() => {
            setSelectedRound(SECOND_SURVEY_ROUND);
            setIsConvictionExpanded(false);
            setIsRoundMenuVisible(false);
            markResultsTabVisited(SECOND_SURVEY_ROUND);
        }, [markResultsTabVisited])
    );

    useFocusEffect(
        useCallback(() => {
            const shouldPromptForReview = isEligibleForResultsReviewPrompt({
                answersCount: Object.keys(secondRoundState.answers).length,
                hasSeenResultsRatingPrompt,
                profile: secondRoundState.profile,
            });
            if (!shouldPromptForReview) {
                return;
            }

            const timer = setTimeout(() => {
                markResultsRatingPromptSeen();
                void (async () => {
                    const nativePromptRequested = await requestNativeStoreReview();
                    if (nativePromptRequested) return;

                    Alert.alert(t("rateAppFallbackTitle"), t("rateAppFallbackMessage"), [
                        {
                            text: t("rateAppFallbackSecondary"),
                            style: "cancel",
                        },
                        {
                            text: t("rateAppFallbackPrimary"),
                            onPress: () => {
                                void (async () => {
                                    const opened = await openStoreListing();
                                    if (!opened) {
                                        Alert.alert(
                                            t("common:linkOpenErrorTitle"),
                                            t("common:linkOpenErrorMessage")
                                        );
                                    }
                                })();
                            },
                        },
                    ]);
                })();
            }, 2000);

            return () => clearTimeout(timer);
        }, [
            hasSeenResultsRatingPrompt,
            markResultsRatingPromptSeen,
            secondRoundState.answers,
            secondRoundState.profile,
            t,
        ])
    );

    const analytics = useMemo(
        () =>
            computeGlobalAnalytics(
                answers,
                roundCards,
                roundCandidates,
                candidateRanking
            ),
        [answers, candidateRanking, roundCandidates, roundCards]
    );

    const totalSwipes = analytics.totalSwipes || 1;
    const breakdownSegments = [
        {
            key: "strongly_disagree",
            count: analytics.breakdown.strongly_disagree,
            color: "#991B1B",
            label: t("swipeStronglyDisagree"),
        },
        {
            key: "disagree",
            count: analytics.breakdown.disagree,
            color: "#EF4444",
            label: t("swipeDisagree"),
        },
        {
            key: "skip",
            count: analytics.breakdown.skip,
            color: "#D1D5DB",
            label: t("swipeSkip"),
        },
        {
            key: "agree",
            count: analytics.breakdown.agree,
            color: "#22C55E",
            label: t("swipeAgree"),
        },
        {
            key: "strongly_agree",
            count: analytics.breakdown.strongly_agree,
            color: "#166534",
            label: t("swipeStronglyAgree"),
        },
    ].filter((segment) => segment.count > 0);
    const decisivenessEmoji =
        analytics.decisivenessScore >= 60
            ? "🔥"
            : analytics.decisivenessScore >= 30
                ? "💪"
                : "🤔";
    const hasRankingResults = candidateRanking.length > 0;
    const roundTitle =
        selectedRound === SECOND_SURVEY_ROUND
            ? t("secondRoundResultsTitle")
            : t("firstRoundResultsTitle");
    const firstRoundLabel = t("firstRoundShort");
    const secondRoundLabel = t("secondRoundShort");

    const handleRetake = () => {
        reset(SECOND_SURVEY_ROUND);
        setSelectedRound(SECOND_SURVEY_ROUND);
        router.replace("/(tabs)/cards");
    };

    const handleCandidatePress = (candidateId: string) => {
        router.push({
            pathname: "/survey/candidate-breakdown",
            params: { candidateId, roundId: selectedRound },
        });
    };

    const handleSelectRound = (roundId: SurveyRoundId) => {
        setSelectedRound(roundId);
        setIsConvictionExpanded(false);
        setIsRoundMenuVisible(false);
    };

    const Header = (
        <View className="relative items-center justify-center mt-2 mb-6" style={{ minHeight: 56 }}>
            <Text
                className="text-[22px] tracking-wide"
                style={{ fontFamily: "ArialRoundedMTBold" }}
                accessibilityRole="header"
            >
                <Text style={{ color: "#1A202C" }}>Citoyen </Text>
                <Text style={{ color: "#60A5FA" }}>Informé</Text>
            </Text>
            <Text className="font-body text-sm text-text-caption mt-1">
                {roundTitle}
            </Text>

            <View className="absolute right-0 top-0 items-center">
                <Pressable
                    onPress={() => setIsRoundMenuVisible(true)}
                    className="rounded-full w-11 h-11 items-center justify-center"
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderWidth: 1,
                        borderColor: "#D8E0EA",
                        shadowColor: "#0F172A",
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 3 },
                        elevation: 4,
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={t("resultsMenuLabel")}
                >
                    <Ionicons name="ellipsis-vertical" size={20} color="#1E2A44" />
                </Pressable>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-warm-white" style={{ paddingTop: insets.top }}>
            <Modal
                visible={isRoundMenuVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setIsRoundMenuVisible(false)}
            >
                <View className="flex-1" pointerEvents="box-none">
                    <Pressable
                        className="absolute inset-0 bg-black/10"
                        onPress={() => setIsRoundMenuVisible(false)}
                        accessibilityRole="button"
                        accessibilityLabel={t("common:close")}
                    />

                    <View
                        className="px-4"
                        pointerEvents="box-none"
                        style={{ paddingTop: insets.top + 10 }}
                    >
                        <View className="items-end">
                            <View
                                className="rounded-2xl bg-white overflow-hidden"
                                style={{
                                    minWidth: 248,
                                    borderWidth: 1,
                                    borderColor: "#D8E0EA",
                                    shadowColor: "#0F172A",
                                    shadowOpacity: 0.12,
                                    shadowRadius: 14,
                                    shadowOffset: { width: 0, height: 6 },
                                    elevation: 6,
                                }}
                            >
                                <Pressable
                                    onPress={() => handleSelectRound(FIRST_SURVEY_ROUND)}
                                    className="px-4 py-3.5"
                                    accessibilityRole="button"
                                    accessibilityLabel={t("showFirstRoundResults")}
                                >
                                    <Text
                                        className="font-body-medium text-sm"
                                        style={{
                                            color:
                                                selectedRound === FIRST_SURVEY_ROUND
                                                    ? "#1E2A44"
                                                    : "#9CA3AF",
                                        }}
                                    >
                                        {firstRoundLabel}
                                    </Text>
                                </Pressable>

                                <View style={{ height: 1, backgroundColor: "#EEF2F7" }} />

                                <Pressable
                                    onPress={() => handleSelectRound(SECOND_SURVEY_ROUND)}
                                    className="px-4 py-3.5"
                                    accessibilityRole="button"
                                    accessibilityLabel={t("showSecondRoundResults")}
                                >
                                    <Text
                                        className="font-body-medium text-sm"
                                        style={{
                                            color:
                                                selectedRound === SECOND_SURVEY_ROUND
                                                    ? "#1E2A44"
                                                    : "#9CA3AF",
                                        }}
                                    >
                                        {secondRoundLabel}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {hasRankingResults ? (
                <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
                    {Header}

                    {candidateRanking.length >= 3 && (
                        <Podium
                            ranking={candidateRanking}
                            candidates={roundCandidates}
                            onCandidatePress={handleCandidatePress}
                            triggerCelebration={triggerCelebration}
                        />
                    )}

                    <AlignmentRanking
                        ranking={candidateRanking}
                        candidates={roundCandidates}
                        onCandidatePress={handleCandidatePress}
                    />

                    <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#EEF2F7" }}>
                        <Text className="font-display-semibold text-lg text-civic-navy mb-3">
                            {t("statsSectionTitle")}
                        </Text>

                        <View className="bg-white rounded-xl p-4 mb-3">
                            <Text className="font-body text-sm text-text-body mb-1">
                                {t("statsTotalSwipesTitle")}
                            </Text>
                            <Text className="font-display-bold text-3xl text-civic-navy">
                                {analytics.totalSwipes}
                            </Text>
                        </View>

                        <Pressable
                            className="bg-white rounded-xl p-4 mb-3"
                            onPress={() => setIsConvictionExpanded((prev) => !prev)}
                            accessibilityRole="button"
                            accessibilityLabel={t("statsConvictionTitle")}
                        >
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="font-display-medium text-base text-civic-navy flex-1 pr-3">
                                    {t("statsConvictionTitle")}
                                </Text>
                                <View className="items-center">
                                    <Text className="text-2xl">{decisivenessEmoji}</Text>
                                    <Text className="font-display-bold text-2xl text-civic-navy">
                                        {analytics.decisivenessScore}%
                                    </Text>
                                </View>
                            </View>
                            {isConvictionExpanded && (
                                <Text className="font-body text-sm text-text-body">
                                    {t("statsConvictionDescription")}
                                </Text>
                            )}
                            <View className="items-center mt-2">
                                <Ionicons
                                    name={isConvictionExpanded ? "chevron-up" : "chevron-down"}
                                    size={16}
                                    color="#6B7280"
                                />
                            </View>
                        </Pressable>

                        <View className="bg-white rounded-xl p-4">
                            <Text className="font-display-medium text-base text-civic-navy mb-3">
                                {t("statsBreakdownTitle")}
                            </Text>

                            <View
                                className="flex-row h-5 rounded-full overflow-hidden mb-3"
                                accessibilityRole="summary"
                                accessibilityLabel={t("statsBreakdownTitle")}
                            >
                                {breakdownSegments.length > 0 ? (
                                    breakdownSegments.map((segment) => (
                                        <View
                                            key={segment.key}
                                            style={{
                                                backgroundColor: segment.color,
                                                flex: segment.count / totalSwipes,
                                            }}
                                        />
                                    ))
                                ) : (
                                    <View style={{ backgroundColor: "#D1D5DB", flex: 1 }} />
                                )}
                            </View>

                            <View className="gap-2">
                                {breakdownSegments.length > 0 ? (
                                    breakdownSegments.map((segment) => (
                                        <View key={`legend-${segment.key}`} className="flex-row items-center">
                                            <View
                                                className="w-2.5 h-2.5 rounded-full mr-2"
                                                style={{ backgroundColor: segment.color }}
                                            />
                                            <Text className="font-body text-sm text-text-body">
                                                {segment.count} {segment.label}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text className="font-body text-sm text-text-body">
                                        {t("statsNoSwipesYet")}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <View className="bg-warm-gray rounded-xl p-4 mb-4 mt-4">
                        <Text className="font-display-medium text-sm text-civic-navy mb-2">
                            {t("whyThisResult")}
                        </Text>
                        <Text className="font-body text-sm text-text-body">
                            {t("whyThisResultExplanation")}
                        </Text>
                    </View>

                    {selectedRound === SECOND_SURVEY_ROUND && (
                        <View className="flex-row gap-3 mt-4 mb-4">
                            <Pressable
                                onPress={handleRetake}
                                accessibilityRole="button"
                                accessibilityLabel={t("retakeSecondRoundSurvey")}
                                className="bg-warm-gray rounded-xl py-3 px-6 flex-1 items-center"
                                style={{ minHeight: 48 }}
                            >
                                <Text className="font-display-medium text-civic-navy">
                                    {t("retakeSecondRoundSurvey")}
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    <FeedbackAction screen="survey" />
                </ScrollView>
            ) : (
                <View className="flex-1 bg-warm-white px-4">
                    {Header}

                    <View className="flex-1 items-center justify-center p-6">
                        <Text className="font-display-bold text-xl text-civic-navy mb-4 text-center">
                            {t("noResultsTitle")}
                        </Text>
                        <Text className="font-body text-text-body text-center">
                            {selectedRound === SECOND_SURVEY_ROUND
                                ? t("noSecondRoundResultsDescription")
                                : t("noResultsDescription")}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}
