import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  useReducedMotion,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const { t } = useTranslation("errors");
  const reduceMotion = useReducedMotion();

  if (isConnected) return null;

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(300)}
      exiting={reduceMotion ? undefined : FadeOut.duration(300)}
    >
      <View className="bg-amber-50 px-4 py-2 flex-row items-center justify-center">
        <Ionicons
          name="cloud-offline-outline"
          size={16}
          color="#92400E"
          style={{ marginRight: 8 }}
        />
        <Text className="font-body text-xs text-amber-800">
          {t("offlineTitle")}
        </Text>
      </View>
    </Animated.View>
  );
}
