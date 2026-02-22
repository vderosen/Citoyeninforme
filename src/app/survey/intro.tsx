import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SurveyIntroScreen() {
  const { t } = useTranslation("common");
  const router = useRouter();

  useEffect(() => {
    router.replace("/(tabs)/cards");
  }, [router]);

  return (
    <View className="flex-1 bg-warm-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-body text-text-caption">
          {t("loading")}
        </Text>
      </View>
    </View>
  );
}
