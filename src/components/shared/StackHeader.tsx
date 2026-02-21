import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";

export function StackHeader({ options }: NativeStackHeaderProps) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const showBack = options.headerBackVisible !== false && router.canGoBack();

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: "#1B2A4A" }}>
      <View className="h-11 flex-row items-center">
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("back")}
            className="ml-4 p-2"
          >
            <Ionicons name="chevron-back" size={22} color="#FAFAF8" />
          </Pressable>
        ) : (
          <View style={{ width: 38 }} className="ml-4" />
        )}
        <Text
          className="flex-1 text-center font-display-semibold text-[17px] text-text-inverse"
          numberOfLines={1}
        >
          {options.title}
        </Text>
        <View style={{ width: 38 }} className="mr-4" />
      </View>
    </View>
  );
}
