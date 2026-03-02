import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { AlignmentRanking } from "../../components/survey/AlignmentRanking";
import { Podium } from "../../components/survey/Podium";
import { FeedbackAction } from "../../components/shared/FeedbackAction";
import { ShareResultsModal } from "../../components/survey/ShareResultsModal";
import { Ionicons } from "@expo/vector-icons";
import { usePodiumCelebrationTrigger } from "../../hooks/usePodiumCelebrationTrigger";
import { computeGlobalAnalytics } from "../../utils/computeSwipeAnalytics";

export default function MatchesScreen() {
    const { t } = useTranslation("survey");
    const router = useRouter();
    const candidates = useElectionStore((s) => s.candidates);
    const statementCards = useElectionStore((s) => s.statementCards);
    const profile = useSurveyStore((s) => s.profile);
    const answers = useSurveyStore((s) => s.answers);
    const reset = useSurveyStore((s) => s.reset);
    const markResultsTabVisited = useSurveyStore((s) => s.markResultsTabVisited);
    const triggerCelebration = usePodiumCelebrationTrigger(profile);
    const [isShareModalVisible, setIsShareModalVisible] = useState(false);
    const [isConvictionExpanded, setIsConvictionExpanded] = useState(false);
    const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            markResultsTabVisited();
        }, [markResultsTabVisited])
    );

    if (!profile || profile.candidateRanking.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-warm-white p-6">
                <Text className="font-display-bold text-xl text-civic-navy mb-4 text-center">
                    {t("noResultsTitle")}
                </Text>
                <Text className="font-body text-text-body text-center">
                    {t("noResultsDescription")}
                </Text>
            </View>
        );
    }

    const handleRetake = () => {
        reset();
        router.replace("/(tabs)/cards");
    };

    const handleCandidatePress = (candidateId: string) => {
        // We will pass the candidateId downstream to show the score breakdown modal
        // For now, we remain on this screen but open the modal
        // Ideally handled via state, or a subroute modal.
        router.push({
            pathname: "/survey/candidate-breakdown",
            params: { candidateId }
        });
    };

    const analytics = useMemo(
        () =>
            computeGlobalAnalytics(
                answers,
                statementCards,
                candidates,
                profile.candidateRanking
            ),
        [answers, statementCards, candidates, profile.candidateRanking]
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

    return (
        <View className="flex-1 bg-warm-white" style={{ paddingTop: insets.top }}>

            <ShareResultsModal
                visible={isShareModalVisible}
                onClose={() => setIsShareModalVisible(false)}
                ranking={profile.candidateRanking}
                candidates={candidates}
                totalVotes={Object.keys(answers).length}
            />

            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
                <View className="flex-row justify-between items-center mt-2 mb-6">
                    <Text
                        className="font-display-bold text-2xl text-civic-navy"
                        accessibilityRole="header"
                    >
                        {t("resultsTitle")}
                    </Text>

                    {profile.candidateRanking.length >= 3 && (
                        <Pressable
                            onPress={() => setIsShareModalVisible(true)}
                            className="rounded-full w-10 h-10 items-center justify-center shadow-sm"
                            style={{ backgroundColor: '#E84855' }}
                            accessibilityRole="button"
                            accessibilityLabel={t("shareResults")}
                        >
                            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                        </Pressable>
                    )}
                </View>

                {profile.candidateRanking.length >= 3 && (
                    <Podium
                        ranking={profile.candidateRanking}
                        candidates={candidates}
                        onCandidatePress={handleCandidatePress}
                        triggerCelebration={triggerCelebration}
                    />
                )}

                <AlignmentRanking
                    ranking={profile.candidateRanking}
                    candidates={candidates}
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

                <View className="flex-row gap-3 mt-4 mb-4">
                    <Pressable
                        onPress={handleRetake}
                        accessibilityRole="button"
                        accessibilityLabel={t("retakeSurvey")}
                        className="bg-warm-gray rounded-xl py-3 px-6 flex-1 items-center"
                        style={{ minHeight: 48 }}
                    >
                        <Text className="font-display-medium text-civic-navy">
                            {t("retakeSurvey")}
                        </Text>
                    </Pressable>
                </View>

                <FeedbackAction screen="survey" />
            </ScrollView>
        </View>
    );
}
