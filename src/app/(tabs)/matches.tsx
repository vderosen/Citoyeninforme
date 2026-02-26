import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter, Tabs } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { AlignmentRanking } from "../../components/survey/AlignmentRanking";
import { Podium } from "../../components/survey/Podium";
import { FeedbackAction } from "../../components/shared/FeedbackAction";
import { ShareResultsModal } from "../../components/survey/ShareResultsModal";
import { SwipeAnalyticsModal } from "../../components/survey/SwipeAnalyticsModal";
import { Ionicons } from "@expo/vector-icons";
import { usePodiumCelebrationTrigger } from "../../hooks/usePodiumCelebrationTrigger";

export default function MatchesScreen() {
    const { t } = useTranslation(["survey", "common"]);
    const router = useRouter();
    const candidates = useElectionStore((s) => s.candidates);
    const statementCards = useElectionStore((s) => s.statementCards);
    const profile = useSurveyStore((s) => s.profile);
    const answers = useSurveyStore((s) => s.answers);
    const reset = useSurveyStore((s) => s.reset);
    const triggerCelebration = usePodiumCelebrationTrigger(profile);
    const [isShareModalVisible, setIsShareModalVisible] = useState(false);
    const [isAnalyticsModalVisible, setIsAnalyticsModalVisible] = useState(false);
    const insets = useSafeAreaInsets();

    if (!profile || profile.candidateRanking.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-warm-white p-6">
                <Text className="font-display-bold text-xl text-civic-navy mb-4 text-center">
                    {t("survey:noResultsTitle")}
                </Text>
                <Text className="font-body text-text-body text-center">
                    {t("survey:noResultsDescription")}
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

    return (
        <View className="flex-1 bg-warm-white" style={{ paddingTop: insets.top }}>

            <ShareResultsModal
                visible={isShareModalVisible}
                onClose={() => setIsShareModalVisible(false)}
                ranking={profile.candidateRanking}
                candidates={candidates}
                totalVotes={Object.keys(answers).length}
            />

            <SwipeAnalyticsModal
                visible={isAnalyticsModalVisible}
                onClose={() => setIsAnalyticsModalVisible(false)}
                answers={answers}
                cards={statementCards}
                candidates={candidates}
                ranking={profile.candidateRanking}
            />

            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
                <View className="flex-row justify-between items-center mt-2 mb-6">
                    <Text
                        className="font-display-bold text-2xl text-civic-navy"
                        accessibilityRole="header"
                    >
                        {t("survey:resultsTitle")}
                    </Text>

                    {profile.candidateRanking.length >= 3 && (
                        <Pressable
                            onPress={() => setIsShareModalVisible(true)}
                            className="rounded-full w-10 h-10 items-center justify-center shadow-sm"
                            style={{ backgroundColor: '#E84855' }}
                            accessibilityRole="button"
                            accessibilityLabel={t("survey:shareResults")}
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
                    headerRight={
                        <Pressable
                            onPress={() => setIsAnalyticsModalVisible(true)}
                            className="bg-white rounded-full w-9 h-9 items-center justify-center border border-gray-200 shadow-sm active:opacity-70"
                            accessibilityRole="button"
                            accessibilityLabel="Voir les statistiques"
                        >
                            <Ionicons name="bar-chart-outline" size={18} color="#1A202C" />
                        </Pressable>
                    }
                />

                <View className="bg-warm-gray rounded-xl p-4 mb-4 mt-4">
                    <Text className="font-display-medium text-sm text-civic-navy mb-2">
                        {t("survey:whyThisResult")}
                    </Text>
                    <Text className="font-body text-sm text-text-body">
                        {t("survey:whyThisResultExplanation")}
                    </Text>
                </View>

                <View className="flex-row gap-3 mt-4 mb-4">
                    <Pressable
                        onPress={handleRetake}
                        accessibilityRole="button"
                        accessibilityLabel={t("survey:retakeSurvey")}
                        className="bg-warm-gray rounded-xl py-3 px-6 flex-1 items-center"
                        style={{ minHeight: 48 }}
                    >
                        <Text className="font-display-medium text-civic-navy">
                            {t("survey:retakeSurvey")}
                        </Text>
                    </Pressable>
                </View>

                <FeedbackAction screen="survey" />
            </ScrollView>
        </View>
    );
}
