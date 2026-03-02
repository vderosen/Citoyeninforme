import { View, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useMotionPreference } from "../../hooks/useMotionPreference";
import { AppText as Text } from "../ui/AppText";
import { PressableScale } from "../ui/PressableScale";

interface SwipeTutorialOverlayProps {
  onDismiss: () => void;
}

const GESTURES: {
  i18nKey: string;
  detailKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
    {
      i18nKey: "tutorialSwipeRight",
      detailKey: "swipeAgree",
      icon: "arrow-forward",
      color: "#16a34a",
    },
    {
      i18nKey: "tutorialSwipeLeft",
      detailKey: "swipeDisagree",
      icon: "arrow-back",
      color: "#dc2626",
    },
    {
      i18nKey: "tutorialButtonAgree",
      detailKey: "swipeAgree",
      icon: "checkmark",
      color: "#16a34a",
    },
    {
      i18nKey: "tutorialButtonSkip",
      detailKey: "swipeSkip",
      icon: "remove-outline",
      color: "#9ca3af",
    },
    {
      i18nKey: "tutorialButtonDisagree",
      detailKey: "swipeDisagree",
      icon: "close",
      color: "#dc2626",
    },
    {
      i18nKey: "tutorialToggleX2",
      detailKey: "tutorialToggleX2Detail",
      icon: "flash-outline",
      color: "#f59e0b",
    },
  ];

export function SwipeTutorialOverlay({ onDismiss }: SwipeTutorialOverlayProps) {
  const { t } = useTranslation("survey");
  const { shouldAnimate } = useMotionPreference();

  const entering = shouldAnimate ? FadeIn.duration(300) : undefined;

  return (
    <Pressable
      onPress={onDismiss}
      accessibilityViewIsModal={true}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      {/* Prevent taps on the card area from bubbling to the backdrop Pressable */}
      <Pressable onPress={(e) => e.stopPropagation()}>
        <Animated.View entering={entering} style={{ width: '90%', maxWidth: 420, paddingHorizontal: 16 }}>
          <View className="bg-white rounded-3xl p-5 w-full shadow-2xl">
            <Text className="font-heading text-lg text-civic-navy text-center mb-5">
              {t("tutorialTitle")}
            </Text>

            <View className="gap-4 mb-6">
              {GESTURES.map((gesture) => (
                <View key={gesture.i18nKey} className="flex-row items-center gap-3">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${gesture.color}15` }}
                  >
                    <Ionicons name={gesture.icon} size={18} color={gesture.color} />
                  </View>
                  <Text className="font-body text-sm text-civic-navy" style={{ flexShrink: 1 }}>
                    <Text style={{ color: gesture.color }} className="font-semibold">
                      {t(gesture.i18nKey)}
                    </Text>
                    <Text>{" = " + t(gesture.detailKey)}</Text>
                  </Text>
                </View>
              ))}
            </View>

            <PressableScale
              onPress={onDismiss}
              testID="tutorial-dismiss"
              accessibilityRole="button"
              accessibilityLabel={t("tutorialDismiss")}
              className="bg-accent-coral rounded-xl py-3 items-center"
              style={{ minHeight: 48 }}
              ensureMinTouchTarget
            >
              <Text className="font-heading text-base text-white">
                {t("tutorialDismiss")}
              </Text>
            </PressableScale>
          </View>
        </Animated.View>
      </Pressable>
    </Pressable>
  );
}
