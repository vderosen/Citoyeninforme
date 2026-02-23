import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    <LinearGradient
      colors={["#1E2A44", "#2A3C5E"]}
      style={{ paddingTop: insets.top }}
    >
      {/* Background organic shapes for a modern feel */}
      <View className="absolute inset-0 overflow-hidden pointer-events-none">
        <View className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <View className="absolute top-4 -left-8 w-32 h-32 rounded-full bg-[#E84855]/5" />
      </View>

      <View className="h-11 flex-row items-center">
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("back")}
            className="ml-4 p-2 relative z-10"
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View style={{ width: 38 }} className="ml-4" />
        )}
        <Text
          className="flex-1 text-center text-[18px] text-text-inverse tracking-wide relative z-10"
          style={{
            fontFamily: options.title === 'Citoyen Informé' ? 'ArialRoundedMTBold' : 'SpaceGrotesk_700Bold'
          }}
          numberOfLines={1}
        >
          {options.title}
        </Text>
        <View style={{ width: 38 }} className="mr-4" />
      </View>
    </LinearGradient>
  );
}
