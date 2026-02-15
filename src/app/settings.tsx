import { useState } from "react";
import { View, Text, Switch, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "../stores/app";
import { PrivacySection } from "../components/settings/PrivacySection";
import { DataSection } from "../components/settings/DataSection";
import { AboutSection } from "../components/settings/AboutSection";
import { generateExport, shareExport, deleteAllUserData } from "../services/data-export";
import { updateCrashReportingConsent } from "../services/crash-reporting";

export default function SettingsScreen() {
  const { t } = useTranslation("settings");
  const router = useRouter();
  const crashReportingOptIn = useAppStore((s) => s.crashReportingOptIn);
  const setCrashReportingOptIn = useAppStore((s) => s.setCrashReportingOptIn);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const fileUri = await generateExport();
      await shareExport(fileUri);
    } catch {
      Alert.alert(
        t("data.exportError"),
        "Impossible d'exporter les données. Vérifiez l'espace disponible sur votre appareil."
      );
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAllUserData();
      router.replace("/privacy-consent");
    } catch {
      Alert.alert("Erreur", "Impossible de supprimer les données.");
    }
  };

  const handleToggleCrashReporting = (value: boolean) => {
    setCrashReportingOptIn(value);
    updateCrashReportingConsent(value);
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-white" edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        <PrivacySection />

        <DataSection
          onExport={handleExport}
          onDelete={handleDelete}
        />

        {/* Crash Reporting */}
        <View className="mb-6">
          <Text className="font-display-medium text-base text-civic-navy mb-3 px-4">
            {t("crashReporting.title")}
          </Text>

          <View className="bg-warm-gray rounded-xl px-4 py-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-body text-sm text-text-body flex-1 mr-3">
                {t("crashReporting.toggle")}
              </Text>
              <Switch
                value={crashReportingOptIn}
                onValueChange={handleToggleCrashReporting}
                trackColor={{ false: "#D1D5DB", true: "#1B2A4A" }}
                accessibilityLabel={t("crashReporting.toggle")}
              />
            </View>
            <Text className="font-body text-xs text-text-caption">
              {t("crashReporting.description")}
            </Text>
          </View>
        </View>

        <AboutSection />

        {exporting && (
          <View className="items-center py-4">
            <Text className="font-body text-sm text-text-caption">
              Export en cours...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
