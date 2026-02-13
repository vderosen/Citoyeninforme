import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useElectionStore } from "../stores/election";
import { useChatbotStore } from "../stores/chatbot";
import { ThemeFilter } from "../components/ui/ThemeFilter";
import { CandidateList } from "../components/candidates/CandidateList";
import { ComparisonView } from "../components/candidates/ComparisonView";
import type { Position } from "../data/schema";

export default function LearnScreen() {
  const { t } = useTranslation(["learn", "common"]);
  const router = useRouter();
  const themes = useElectionStore((s) => s.themes);
  const candidates = useElectionStore((s) => s.candidates);
  const logistics = useElectionStore((s) => s.logistics);
  const isLoaded = useElectionStore((s) => s.isLoaded);

  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    []
  );

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">{t("common:loading")}</Text>
      </SafeAreaView>
    );
  }

  const setPreloadedContext = useChatbotStore((s) => s.setPreloadedContext);
  const openChatbot = useChatbotStore((s) => s.open);
  const selectMode = useChatbotStore((s) => s.selectMode);

  const handleAskInChat = (position: Position) => {
    const theme = themes.find((t) => t.id === position.themeId);
    const candidate = candidates.find((c) => c.id === position.candidateId);
    const context = `Parlez-moi de la position de ${candidate?.name ?? "ce candidat"} sur ${theme?.name ?? "ce thème"}: "${position.summary}"`;
    setPreloadedContext(context);
    selectMode("learn");
    openChatbot();
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 pt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t("common:back")}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text className="text-blue-600 text-base">
                {t("common:back")}
              </Text>
            </Pressable>
            <Text
              className="text-xl font-bold text-gray-900"
              accessibilityRole="header"
            >
              {t("title")}
            </Text>
            <Pressable
              onPress={() => {
                setCompareMode(!compareMode);
                setSelectedCandidateIds([]);
              }}
              accessibilityRole="button"
              accessibilityLabel={t("compare")}
              className={`px-3 py-1 rounded-full ${
                compareMode ? "bg-blue-600" : "bg-gray-200"
              }`}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text
                className={`text-sm font-medium ${
                  compareMode ? "text-white" : "text-gray-700"
                }`}
              >
                {t("compare")}
              </Text>
            </Pressable>
          </View>

          <ThemeFilter
            themes={themes}
            selectedThemeId={selectedThemeId}
            onSelectTheme={setSelectedThemeId}
          />
        </View>

        {compareMode ? (
          <View className="px-4">
            <Text className="text-sm text-gray-500 mb-3">
              {t("selectCandidates")}
            </Text>
            <View className="flex-row flex-wrap mb-4">
              {candidates.map((candidate) => (
                <Pressable
                  key={candidate.id}
                  onPress={() => toggleCandidateSelection(candidate.id)}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: selectedCandidateIds.includes(candidate.id),
                  }}
                  className={`px-3 py-2 mr-2 mb-2 rounded-full ${
                    selectedCandidateIds.includes(candidate.id)
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                  style={{ minHeight: 44, justifyContent: "center" }}
                >
                  <Text
                    className={`text-sm ${
                      selectedCandidateIds.includes(candidate.id)
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {candidate.name}
                  </Text>
                </Pressable>
              ))}
            </View>
            {selectedCandidateIds.length >= 2 && selectedThemeId && (
              <ComparisonView
                candidateIds={selectedCandidateIds}
                themeId={selectedThemeId}
              />
            )}
            {selectedCandidateIds.length >= 2 && !selectedThemeId && (
              <Text className="text-sm text-gray-500 italic">
                {t("selectTheme")}
              </Text>
            )}
          </View>
        ) : (
          <View className="px-4">
            <CandidateList
              selectedThemeId={selectedThemeId}
              onAskInChat={handleAskInChat}
            />
          </View>
        )}

        {logistics && (
          <View className="px-4 mt-6">
            <Text
              className="text-lg font-semibold text-gray-900 mb-3"
              accessibilityRole="header"
            >
              {t("logistics")}
            </Text>

            <View className="bg-gray-50 rounded-xl p-4 mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                {t("keyDates")}
              </Text>
              {logistics.keyDates.map((item, index) => (
                <View key={index} className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-600 flex-1">
                    {item.label}
                  </Text>
                  <Text className="text-sm font-medium text-gray-800 ml-2">
                    {item.date}
                  </Text>
                </View>
              ))}
            </View>

            <View className="bg-gray-50 rounded-xl p-4 mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                {t("eligibility")}
              </Text>
              {logistics.eligibility.map((step) => (
                <Text key={step.order} className="text-sm text-gray-600 mb-1">
                  {step.order}. {step.text}
                </Text>
              ))}
            </View>

            <View className="bg-gray-50 rounded-xl p-4 mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                {t("votingMethods")}
              </Text>
              {logistics.votingMethods.map((method, index) => (
                <View key={index} className="mb-2">
                  <Text className="text-sm font-medium text-gray-700">
                    {method.type === "in-person"
                      ? "En personne"
                      : method.type === "proxy"
                        ? "Procuration"
                        : "Par courrier"}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {method.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
