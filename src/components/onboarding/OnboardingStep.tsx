import { ReactNode } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { PressableScale } from "../ui/PressableScale";
import * as Haptics from "expo-haptics";

interface OnboardingStepProps {
  title: ReactNode;
  illustration?: ReactNode;
  children: ReactNode;
  ctaLabel: string;
  onCtaPress: () => void;
  currentStep: number;
  totalSteps: number;
  /** Hide the primary CTA (e.g., when step handles its own CTAs) */
  hideCta?: boolean;
}

const MAX_CONTENT_WIDTH = 480;

export function OnboardingStep({
  title,
  illustration,
  children,
  ctaLabel,
  onCtaPress,
  currentStep,
  totalSteps,
  hideCta,
}: OnboardingStepProps) {
  const { t } = useTranslation("onboarding");
  const { width } = useWindowDimensions();

  return (
    <View style={{ width }} className="flex-1 bg-warm-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 48,
          paddingBottom: 32,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-1 w-full"
          style={{ maxWidth: MAX_CONTENT_WIDTH }}
        >
          {/* Title */}
          <View className="mb-6">
            {typeof title === "string" ? (
              <Text
                className="font-display-bold text-3xl text-civic-navy"
                accessibilityRole="header"
              >
                {title}
              </Text>
            ) : (
              title
            )}
          </View>

          {/* Illustration */}
          {illustration && (
            <View className="mb-8 items-center">{illustration}</View>
          )}

          {/* Content */}
          <View className="flex-1">{children}</View>

          {/* Bottom section: CTA + progress */}
          <View className="mt-8 items-center">
            {!hideCta && (
              <PressableScale
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onCtaPress();
                }}
                className="bg-civic-navy rounded-xl py-4 w-full items-center mb-4 shadow-sm"
                style={{ minHeight: 48 }}
                accessibilityRole="button"
                accessibilityLabel={ctaLabel}
              >
                <Text className="font-display-medium text-text-inverse text-base">
                  {ctaLabel}
                </Text>
              </PressableScale>
            )}

            <Text className="font-body text-sm text-text-caption">
              {t("progress", { current: currentStep, total: totalSteps })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
