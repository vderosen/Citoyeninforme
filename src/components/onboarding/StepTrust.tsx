import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingStep } from "./OnboardingStep";

interface StepTrustProps {
  onNext: () => void;
  onComplete: (target: "survey" | "candidates" | "assistant") => void;
  currentStep: number;
  totalSteps: number;
}

export function StepTrust({
  onNext,
  currentStep,
  totalSteps,
}: StepTrustProps) {
  const { t } = useTranslation("onboarding");

  return (
    <OnboardingStep
      title={
        <Text
          className="font-display-bold text-3xl text-civic-navy"
          accessibilityRole="header"
        >
          {t("step4.title")}{"\n"}
          <Text className="italic">{t("step4.titleEmphasis")}</Text>
        </Text>
      }
      ctaLabel={t("step4.cta")}
      onCtaPress={onNext}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <View className="gap-5">
        {/* Badge: first "does" item as a green pill */}
        <View className="flex-row items-center self-start rounded-full px-4 py-2"
          style={{ backgroundColor: "rgba(22, 163, 74, 0.1)" }}
        >
          <Ionicons
            name="checkmark-circle"
            size={18}
            color="#16A34A"
            style={{ marginRight: 8 }}
          />
          <Text className="font-body-medium text-sm" style={{ color: "#16A34A" }}>
            {t("step4.does1")}
          </Text>
        </View>

        {/* Second "does" item */}
        <View className="flex-row items-start gap-3">
          <Ionicons
            name="checkmark-circle"
            size={20}
            color="#16A34A"
            style={{ marginTop: 2 }}
          />
          <Text className="font-body text-base text-text-body flex-1 leading-6">
            {t("step4.does2")}
          </Text>
        </View>

        {/* Separator */}
        <View className="h-px bg-warm-gray" />

        {/* "Doesn't" items */}
        <View className="gap-3">
          {[t("step4.doesNot1"), t("step4.doesNot2"), t("step4.doesNot3")].map(
            (text, i) => (
              <View key={i} className="flex-row items-start gap-3">
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#DC2626"
                  style={{ marginTop: 2 }}
                />
                <Text className="font-body text-base text-text-body flex-1 leading-6">
                  {text}
                </Text>
              </View>
            )
          )}
        </View>
      </View>
    </OnboardingStep>
  );
}
