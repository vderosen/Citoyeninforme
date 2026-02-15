import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { CivicFact } from "../../data/schema";

interface CivicPrimerProps {
  facts: CivicFact[];
  onContinue: () => void;
}

export function CivicPrimer({ facts, onContinue }: CivicPrimerProps) {
  const { t } = useTranslation("survey");
  const { t: tCommon } = useTranslation("common");

  return (
    <View className="px-4 pb-8">
      {facts.map((fact) => (
        <View key={fact.id} className="bg-blue-50 rounded-xl p-4 mb-4">
          <Text className="text-base text-gray-800 leading-6">
            {fact.text}
          </Text>
          <Text className="text-xs text-gray-400 mt-2">
            {tCommon("source")}: {fact.source.title}
          </Text>
        </View>
      ))}

      <Pressable
        onPress={onContinue}
        className="bg-blue-600 rounded-xl py-4 px-6 mt-4 items-center"
        style={{ minHeight: 48 }}
        accessibilityRole="button"
        accessibilityLabel={t("startQuestionnaire")}
      >
        <Text className="text-white font-semibold text-base">
          {t("startQuestionnaire")}
        </Text>
      </Pressable>
    </View>
  );
}
