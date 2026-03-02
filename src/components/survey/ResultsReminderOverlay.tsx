import { Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useMotionPreference } from "../../hooks/useMotionPreference";
import { AppText as Text } from "../ui/AppText";
import { PressableScale } from "../ui/PressableScale";

interface ResultsReminderOverlayProps {
  onDismiss: () => void;
  onOpenResults: () => void;
}

export function ResultsReminderOverlay({
  onDismiss,
  onOpenResults,
}: ResultsReminderOverlayProps) {
  const { t } = useTranslation("survey");
  const { shouldAnimate } = useMotionPreference();

  const entering = shouldAnimate ? FadeIn.duration(300) : undefined;

  return (
    <Pressable
      onPress={onDismiss}
      accessibilityViewIsModal={true}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <Pressable onPress={(e) => e.stopPropagation()}>
        <Animated.View
          entering={entering}
          style={{ width: "82%", maxWidth: 360 }}
        >
          <View className="bg-white rounded-3xl p-5 w-full shadow-2xl">
            <View className="items-center mb-3">
              <Text className="font-heading text-lg text-civic-navy text-center">
                {t("resultsReminderModalTitle")}
              </Text>
              <View
                style={{
                  marginTop: 8,
                  width: 140,
                  height: 1,
                  backgroundColor: "#CBD5E1",
                }}
              />
            </View>

            <Text className="font-body text-base text-civic-navy text-center mb-1">
              {t("resultsReminderTitle")}
            </Text>

            <Text className="font-body text-base text-text-body text-center mb-6">
              {t("resultsReminderSubtitle")}
            </Text>

            <PressableScale
              onPress={onOpenResults}
              accessibilityRole="button"
              accessibilityLabel={t("resultsReminderPrimary")}
              className="bg-accent-coral rounded-xl py-3 items-center"
              style={{ minHeight: 48 }}
              ensureMinTouchTarget
            >
              <Text className="font-heading text-base text-white">
                {t("resultsReminderPrimary")}
              </Text>
            </PressableScale>

            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel={t("resultsReminderSecondary")}
              className="pt-3 pb-1 items-center"
            >
              <Text className="font-body text-base text-text-caption">
                {t("resultsReminderSecondary")}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Pressable>
  );
}
