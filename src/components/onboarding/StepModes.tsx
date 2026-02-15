import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingStep } from "./OnboardingStep";

interface StepModesProps {
  onNext: () => void;
  onComplete: (target: "survey" | "candidates" | "assistant") => void;
  currentStep: number;
  totalSteps: number;
}

const CARDS: { icon: keyof typeof Ionicons.glyphMap; titleKey: string; descKey: string }[] = [
  { icon: "clipboard-outline", titleKey: "step3.card1.title", descKey: "step3.card1.description" },
  { icon: "people-outline", titleKey: "step3.card2.title", descKey: "step3.card2.description" },
  { icon: "chatbubble-outline", titleKey: "step3.card3.title", descKey: "step3.card3.description" },
];

export function StepModes({
  onNext,
  currentStep,
  totalSteps,
}: StepModesProps) {
  const { t } = useTranslation("onboarding");

  return (
    <OnboardingStep
      title={t("step3.title")}
      ctaLabel={t("step3.cta")}
      onCtaPress={onNext}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <View className="gap-3">
        {CARDS.map((card) => (
          <View
            key={card.titleKey}
            className="bg-warm-gray rounded-xl p-4 flex-row items-center gap-4 shadow-card"
          >
            <Ionicons name={card.icon} size={28} color="#1B2A4A" />
            <View className="flex-1">
              <Text className="font-display-medium text-base text-civic-navy">
                {t(card.titleKey)}
              </Text>
              <Text className="font-body text-sm text-text-body mt-1">
                {t(card.descKey)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </OnboardingStep>
  );
}
