import { useMemo } from "react";
import { View, Text, FlatList, Pressable, Image } from "react-native";
import { useTranslation } from "react-i18next";
import type { Candidate } from "../../data/schema";
import { deterministicShuffle, dailySeed } from "../../utils/shuffle";

interface CandidateGalleryProps {
  candidates: Candidate[];
  onCandidatePress: (candidateId: string) => void;
  activeThemeFilter?: string;
  positionSnippets?: Record<string, string>;
}

export function CandidateGallery({
  candidates,
  onCandidatePress,
  activeThemeFilter,
  positionSnippets,
}: CandidateGalleryProps) {
  const { t } = useTranslation("candidates");

  const shuffled = useMemo(
    () => deterministicShuffle(candidates, dailySeed()),
    [candidates]
  );

  if (candidates.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8 py-12">
        <Text className="text-lg font-semibold text-gray-800 text-center mb-2">
          {t("emptyGallery")}
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          {t("emptyGalleryDescription")}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={shuffled}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onCandidatePress(item.id)}
          className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden"
          style={{ minHeight: 44 }}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${item.party}`}
        >
          {item.photoUrl ? (
            <Image
              source={{ uri: item.photoUrl }}
              className="w-full aspect-square bg-gray-100"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View className="w-full aspect-square bg-gray-200 items-center justify-center">
              <Text className="text-3xl">👤</Text>
            </View>
          )}
          <View className="p-3">
            <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
              {item.party}
            </Text>
            {activeThemeFilter && positionSnippets?.[item.id] && (
              <Text className="text-xs text-gray-600 mt-1" numberOfLines={2}>
                {positionSnippets[item.id]}
              </Text>
            )}
          </View>
        </Pressable>
      )}
    />
  );
}
