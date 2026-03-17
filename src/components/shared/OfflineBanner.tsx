import { useEffect, useRef, useState } from "react";
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
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const { t } = useTranslation("errors");
  const reduceMotion = useReducedMotion();
  const [shouldShow, setShouldShow] = useState(false);
  const showDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isConfirmedOffline = !isConnected && isInternetReachable === false;

  useEffect(() => {
    if (!isConfirmedOffline) {
      if (showDelayTimerRef.current) {
        clearTimeout(showDelayTimerRef.current);
        showDelayTimerRef.current = null;
      }
      setShouldShow(false);
      return;
    }

    showDelayTimerRef.current = setTimeout(() => {
      setShouldShow(true);
      showDelayTimerRef.current = null;
    }, 1000);

    return () => {
      if (showDelayTimerRef.current) {
        clearTimeout(showDelayTimerRef.current);
        showDelayTimerRef.current = null;
      }
    };
  }, [isConfirmedOffline]);

  if (!shouldShow) return null;

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
