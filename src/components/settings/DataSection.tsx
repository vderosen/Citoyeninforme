import { View, Text, Pressable, Alert } from "react-native";
import { useTranslation } from "react-i18next";

interface DataSectionProps {
  onExport: () => void;
  onDelete: () => void;
}

export function DataSection({ onExport, onDelete }: DataSectionProps) {
  const { t } = useTranslation("settings");

  const handleDelete = () => {
    Alert.alert(
      t("data.deleteConfirmTitle"),
      t("data.deleteConfirmMessage"),
      [
        { text: t("data.deleteCancel"), style: "cancel" },
        {
          text: t("data.deleteConfirmButton"),
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <View className="mb-6">
      <Text className="font-display-medium text-base text-civic-navy mb-3 px-4">
        {t("data.title")}
      </Text>

      <Pressable
        onPress={onExport}
        className="bg-warm-gray rounded-xl px-4 py-3 mb-2"
        style={{ minHeight: 44 }}
        accessibilityRole="button"
        accessibilityLabel={t("data.export")}
      >
        <Text className="font-body-medium text-sm text-civic-navy">
          {t("data.export")}
        </Text>
        <Text className="font-body text-xs text-text-caption mt-1">
          {t("data.exportDescription")}
        </Text>
      </Pressable>

      <Pressable
        onPress={handleDelete}
        className="bg-red-50 rounded-xl px-4 py-3"
        style={{ minHeight: 44 }}
        accessibilityRole="button"
        accessibilityLabel={t("data.delete")}
      >
        <Text className="font-body-medium text-sm text-red-700">
          {t("data.delete")}
        </Text>
        <Text className="font-body text-xs text-red-500 mt-1">
          {t("data.deleteDescription")}
        </Text>
      </Pressable>
    </View>
  );
}
