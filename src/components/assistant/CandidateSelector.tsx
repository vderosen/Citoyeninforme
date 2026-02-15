import { FlatList, View, Text, Pressable, Image } from "react-native";
import { useTranslation } from "react-i18next";
import type { Candidate } from "../../data/schema";
import { getCandidateImageSource } from "../../utils/candidateImageSource";

interface CandidateSelectorProps {
  candidates: Candidate[];
  selectedId: string | null;
  onSelect: (candidateId: string) => void;
}

export function CandidateSelector({
  candidates,
  selectedId,
  onSelect,
}: CandidateSelectorProps) {
  const { t } = useTranslation("assistant");

  return (
    <View className="py-2">
      <Text className="font-body-medium text-xs text-text-caption px-4 mb-2">
        {t("selectCandidate")}
      </Text>
      <FlatList
        data={candidates}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => {
          const imageSource = getCandidateImageSource(item);

          return (
            <Pressable
              onPress={() => onSelect(item.id)}
              className={`items-center px-3 py-2 rounded-xl border ${
                selectedId === item.id
                  ? "bg-accent-coral-light border-accent-coral"
                  : "bg-warm-white border-warm-gray"
              }`}
              style={{ minHeight: 44, minWidth: 72 }}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedId === item.id }}
              accessibilityLabel={item.name}
            >
              {imageSource ? (
                <Image
                  source={imageSource}
                  className="w-10 h-10 rounded-full bg-warm-gray mb-1"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-warm-gray items-center justify-center mb-1">
                  <Text className="text-lg">👤</Text>
                </View>
              )}
              <Text
                className={`text-xs font-body-medium text-center ${
                  selectedId === item.id ? "text-civic-navy" : "text-text-body"
                }`}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
