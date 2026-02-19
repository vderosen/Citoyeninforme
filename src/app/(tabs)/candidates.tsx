import { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useElectionStore } from "../../stores/election";
import { LoadingState } from "../../components/shared/LoadingState";
import { CandidateGallery } from "../../components/candidates/CandidateGallery";

const MAX_COMPARE = 4;
const MIN_COMPARE = 2;

export default function CandidatesScreen() {
  const router = useRouter();
  const { t } = useTranslation("candidates");
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const candidates = useElectionStore((s) => s.candidates);

  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const handleCandidatePress = (candidateId: string) => {
    router.push(`/candidate/${candidateId}`);
  };

  const handleToggleCompare = useCallback((candidateId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, candidateId];
    });
  }, []);

  const handleConfirmCompare = () => {
    if (selectedForCompare.length >= MIN_COMPARE) {
      router.push({
        pathname: "/comparison",
        params: { selected: selectedForCompare.join(",") },
      });
      setCompareMode(false);
      setSelectedForCompare([]);
    }
  };

  const handleCancelCompare = () => {
    setCompareMode(false);
    setSelectedForCompare([]);
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-warm-white">
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
      <View className="flex-1">
        <CandidateGallery
          candidates={candidates}
          onCandidatePress={handleCandidatePress}
          compareMode={compareMode}
          selectedForCompare={selectedForCompare}
          onToggleCompare={handleToggleCompare}
        />

        {/* Compare confirmation bar */}
        {compareMode && (
          <View className="bg-civic-navy px-4 py-3 flex-row items-center gap-3">
            <Pressable
              onPress={handleCancelCompare}
              className="p-2"
              accessibilityRole="button"
              accessibilityLabel={t("compareCancel")}
            >
              <Ionicons name="close" size={22} color="#FAFAF8" />
            </Pressable>
            <Text className="font-body-medium text-sm text-text-inverse flex-1">
              {t("compareCount", { count: selectedForCompare.length, max: MAX_COMPARE })}
            </Text>
            <Pressable
              onPress={handleConfirmCompare}
              disabled={selectedForCompare.length < MIN_COMPARE}
              className={`rounded-xl px-4 py-2 ${
                selectedForCompare.length >= MIN_COMPARE
                  ? "bg-accent-coral"
                  : "bg-warm-gray"
              }`}
              style={{ minHeight: 40 }}
              accessibilityRole="button"
              accessibilityLabel={t("compareConfirm")}
            >
              <Text
                className={`font-display-medium text-sm ${
                  selectedForCompare.length >= MIN_COMPARE
                    ? "text-text-inverse"
                    : "text-text-caption"
                }`}
              >
                {t("compareConfirm")}
              </Text>
            </Pressable>
          </View>
        )}

        {/* FAB: Comparer button */}
        {!compareMode && candidates.length >= MIN_COMPARE && (
          <Pressable
            onPress={() => setCompareMode(true)}
            className="absolute bottom-4 right-4 bg-accent-coral rounded-full px-5 py-3 flex-row items-center gap-2 shadow-lg"
            style={{ minHeight: 48, elevation: 4 }}
            accessibilityRole="button"
            accessibilityLabel={t("compare")}
          >
            <Ionicons name="git-compare-outline" size={20} color="#FAFAF8" />
            <Text className="font-display-medium text-sm text-text-inverse">
              {t("compare")}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
