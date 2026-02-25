import { View, Text, Pressable, ScrollView } from "react-native";
import { useFocusEffect, useRouter, Tabs } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { AlignmentRanking } from "../../components/survey/AlignmentRanking";
import { Podium } from "../../components/survey/Podium";
import { FeedbackAction } from "../../components/shared/FeedbackAction";
import { ShareResultsModal } from "../../components/survey/ShareResultsModal";
import { Ionicons } from "@expo/vector-icons";
import { usePodiumCelebrationTrigger } from "../../hooks/usePodiumCelebrationTrigger";

export default function MatchesScreen() {
    const { t } = useTranslation(["survey", "common"]);
    const router = useRouter();
    const candidates = useElectionStore((s) => s.candidates);
    const profile = useSurveyStore((s) => s.profile);
    const answers = useSurveyStore((s) => s.answers);
    const reset = useSurveyStore((s) => s.reset);
    const triggerCelebration = usePodiumCelebrationTrigger(profile);
    const [isShareModalVisible, setIsShareModalVisible] = useState(false);

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
        <View className="flex-1 bg-warm-white">

            <ShareResultsModal
                visible={isShareModalVisible}
                onClose={() => setIsShareModalVisible(false)}
                ranking={profile.candidateRanking}
                candidates={candidates}
                totalVotes={Object.keys(answers).length}
            />

            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
                <View className="flex-row justify-between items-center mt-6 mb-6">
                    <Text
                        className="font-display-bold text-2xl text-civic-navy"
                        accessibilityRole="header"
                    >
                        {t("survey:resultsTitle")}
                    </Text>

                    {profile.candidateRanking.length >= 3 && (
                        <Pressable
                            onPress={() => setIsShareModalVisible(true)}
                            className="bg-warm-gray rounded-full w-10 h-10 items-center justify-center border border-gray-200"
                            accessibilityRole="button"
                            accessibilityLabel={t("survey:shareResults")}
                        >
                            <Ionicons name="share-outline" size={20} color="#1A202C" />
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
