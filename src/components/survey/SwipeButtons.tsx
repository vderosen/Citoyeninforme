import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { SwipeDirection } from "../../data/schema";

interface SwipeButtonsProps {
  onButtonPress: (direction: SwipeDirection) => void;
  disabled?: boolean;
}

export function SwipeButtons({ onButtonPress, disabled }: SwipeButtonsProps) {
  const { t } = useTranslation("survey");
  const o = disabled ? 0.5 : 1;

  return (
    <View className="px-4 py-4" style={{ opacity: o }}>
      <View className="flex-row items-center justify-between w-full">
        {/* Double Red Cross (-2) */}
        <Pressable
          onPress={() => onButtonPress("strongly_disagree")}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeStronglyDisagree")}
          className="bg-red-50 border border-red-200 rounded-full items-center justify-center shadow-sm"
          style={{ width: 48, height: 48 }}
        >
          <View className="flex-row items-center" style={{ marginLeft: -4 }}>
            <Ionicons name="close" size={20} color="#dc2626" style={{ marginRight: -10 }} />
            <Ionicons name="close" size={20} color="#dc2626" />
          </View>
        </Pressable>

        {/* Single Red Cross (-1) -> Slightly bigger */}
        <Pressable
          onPress={() => onButtonPress("disagree")}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeDisagree")}
          className="bg-red-50 border border-red-200 rounded-full items-center justify-center shadow-sm"
          style={{ width: 64, height: 64 }}
        >
          <Ionicons name="close" size={32} color="#dc2626" />
        </Pressable>

        {/* Neutral Skip (0) */}
        <Pressable
          onPress={() => onButtonPress("skip")}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeSkip")}
          className="bg-gray-50 border border-gray-200 rounded-full items-center justify-center shadow-sm"
          style={{ width: 48, height: 48 }}
        >
          <Text style={{ fontSize: 24, transform: [{ translateY: -1 }] }}>🤷‍♂️</Text>
        </Pressable>

        {/* Single Green Tick (+1) -> Slightly bigger */}
        <Pressable
          onPress={() => onButtonPress("agree")}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeAgree")}
          className="bg-green-50 border border-green-200 rounded-full items-center justify-center shadow-sm"
          style={{ width: 64, height: 64 }}
        >
          <Ionicons name="checkmark" size={32} color="#16a34a" />
        </Pressable>

        {/* Double Green Tick (+2) */}
        <Pressable
          onPress={() => onButtonPress("strongly_agree")}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeStronglyAgree")}
          className="bg-green-50 border border-green-200 rounded-full items-center justify-center shadow-sm"
          style={{ width: 48, height: 48 }}
        >
          <Ionicons name="checkmark-done" size={24} color="#16a34a" />
        </Pressable>
      </View>
    </View>
  );
}
