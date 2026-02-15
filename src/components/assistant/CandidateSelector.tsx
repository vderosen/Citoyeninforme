import { FlatList, View, Text, Pressable, Image } from "react-native";
import { useTranslation } from "react-i18next";
import type { Candidate } from "../../data/schema";

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
      <Text className="text-xs text-gray-500 px-4 mb-2">
        {t("selectCandidate")}
      </Text>
      <FlatList
        data={candidates}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item.id)}
            className={`items-center px-3 py-2 rounded-xl border ${
              selectedId === item.id
                ? "bg-blue-50 border-blue-400"
                : "bg-white border-gray-200"
            }`}
            style={{ minHeight: 44, minWidth: 72 }}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedId === item.id }}
            accessibilityLabel={item.name}
          >
            {item.photoUrl ? (
              <Image
                source={{ uri: item.photoUrl }}
                className="w-10 h-10 rounded-full bg-gray-200 mb-1"
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mb-1">
                <Text className="text-lg">👤</Text>
              </View>
            )}
            <Text
              className={`text-xs font-medium text-center ${
                selectedId === item.id ? "text-blue-700" : "text-gray-700"
              }`}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
