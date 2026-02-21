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
    <View className="px-6 pt-1 pb-3" style={{ opacity: o }}>
      {/* Row 1: Coup de coeur (up) — centered pill */}
      <View className="items-center mb-1.5">
        <Pressable
          onPress={() => onButtonPress("strongly_agree")}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeStronglyAgree")}
          className="bg-amber-50 border border-amber-200 rounded-full px-4 flex-row items-center justify-center gap-1"
          style={{ height: 36 }}
        >
          <Ionicons name="heart" size={15} color="#d97706" />
          <Text
            className="font-body-medium"
            style={{ color: "#d97706", fontSize: 11 }}
          >
            {t("swipeStronglyAgree")}
          </Text>
          <Ionicons
            name="chevron-up"
            size={12}
            color="#d97706"
            style={{ opacity: 0.4, marginLeft: 2 }}
          />
        </Pressable>
      </View>

      {/* Row 2: Disagree (left) + Pas d'avis (center) + Agree (right) */}
      <View className="flex-row items-center gap-2 mb-1.5">
        {/* Disagree */}
        <Pressable
          onPress={() => onButtonPress("disagree")}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeDisagree")}
          className="bg-red-50 border border-red-200 rounded-full px-3 flex-row items-center justify-center gap-1 flex-1"
          style={{ height: 36 }}
        >
          <Ionicons
            name="chevron-back"
            size={12}
            color="#dc2626"
            style={{ opacity: 0.4 }}
          />
          <Ionicons name="close-circle" size={15} color="#dc2626" />
          <Text
            className="font-body-medium"
            style={{ color: "#dc2626", fontSize: 11 }}
          >
            {t("swipeDisagree")}
          </Text>
        </Pressable>

        {/* Skip / Pas d'avis — visible text pill */}
        <Pressable
          onPress={() => onButtonPress("skip")}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeSkip")}
          className="bg-gray-50 border border-gray-200 rounded-full px-3 items-center justify-center"
          style={{ height: 36 }}
        >
          <Text
            className="font-body"
            style={{ color: "#9ca3af", fontSize: 11 }}
          >
            {t("swipeSkip")}
          </Text>
        </Pressable>

        {/* Agree */}
        <Pressable
          onPress={() => onButtonPress("agree")}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeAgree")}
          className="bg-green-50 border border-green-200 rounded-full px-3 flex-row items-center justify-center gap-1 flex-1"
          style={{ height: 36 }}
        >
          <Text
            className="font-body-medium"
            style={{ color: "#16a34a", fontSize: 11 }}
          >
            {t("swipeAgree")}
          </Text>
          <Ionicons name="checkmark-circle" size={15} color="#16a34a" />
          <Ionicons
            name="chevron-forward"
            size={12}
            color="#16a34a"
            style={{ opacity: 0.4 }}
          />
        </Pressable>
      </View>

      {/* Row 3: Catastrophe (down) — centered pill */}
      <View className="items-center">
        <Pressable
          onPress={() => onButtonPress("strongly_disagree")}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeStronglyDisagree")}
          className="bg-gray-50 border border-gray-300 rounded-full px-4 flex-row items-center justify-center gap-1"
          style={{ height: 36 }}
        >
          <Ionicons name="flash" size={15} color="#374151" />
          <Text
            className="font-body-medium"
            style={{ color: "#374151", fontSize: 11 }}
          >
            {t("swipeStronglyDisagree")}
          </Text>
          <Ionicons
            name="chevron-down"
            size={12}
            color="#374151"
            style={{ opacity: 0.4, marginLeft: 2 }}
          />
        </Pressable>
      </View>
    </View>
  );
}
