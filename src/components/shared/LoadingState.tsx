import { View, Text, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useTranslation("common");

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <ActivityIndicator size="large" color="#E8553A" />
      <Text className="font-body text-sm text-text-caption mt-4 text-center">
        {message ?? t("loadingDefault")}
      </Text>
    </View>
  );
}
