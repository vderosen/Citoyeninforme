import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { AlignmentRanking } from "../../components/survey/AlignmentRanking";
import { Podium } from "../../components/survey/Podium";
import { FeedbackAction } from "../../components/shared/FeedbackAction";

export default function MatchesScreen() {
    const { t } = useTranslation(["survey", "common"]);
    const router = useRouter();
    const candidates = useElectionStore((s) => s.candidates);
    const profile = useSurveyStore((s) => s.profile);
    const reset = useSurveyStore((s) => s.reset);

    if (!profile || profile.candidateRanking.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-warm-white p-6">
                <Text className="font-display-bold text-xl text-civic-navy mb-4 text-center">
                    Pas encore de résultats
                </Text>
                <Text className="font-body text-text-body text-center">
                    Allez dans l'onglet Sondage et swipez quelques cartes pour découvrir avec quels candidats vous vous alignez le plus !
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
            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
                <Text
                    className="font-display-bold text-2xl text-civic-navy mt-6 mb-6"
                    accessibilityRole="header"
                >
                    {t("survey:resultsTitle")}
                </Text>

                {profile.candidateRanking.length >= 3 && (
                    <Podium
                        ranking={profile.candidateRanking}
                        candidates={candidates}
                        onCandidatePress={handleCandidatePress}
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
                        Chaque carte avec laquelle vous êtes d'accord ou en désaccord influence votre score final. Les candidats remportent des points quand vos positions concordent avec les leurs. Cliquez sur un candidat pour voir le détail de ses points !
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
