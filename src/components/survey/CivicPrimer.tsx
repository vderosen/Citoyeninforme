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
        <View key={fact.id} className="bg-warm-gray rounded-xl p-4 mb-4">
          <Text className="font-body text-base text-text-body leading-6">
            {fact.text}
          </Text>
          <Text className="font-body text-xs text-text-caption mt-2">
            {tCommon("source")}: {fact.source.title}
          </Text>
        </View>
      ))}

      <Pressable
        onPress={onContinue}
        className="bg-accent-coral rounded-xl py-4 px-6 mt-4 items-center"
        style={{ minHeight: 48 }}
        accessibilityRole="button"
        accessibilityLabel={t("startQuestionnaire")}
      >
        <Text className="font-display-semibold text-text-inverse text-base">
          {t("startQuestionnaire")}
        </Text>
      </Pressable>
    </View>
  );
}
