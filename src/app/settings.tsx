import { useState } from "react";
import { View, Text, Switch, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { useAppStore } from "../stores/app";
import {
  generateExport,
  shareExport,
  deleteAllUserData,
} from "../services/data-export";
import { updateCrashReportingConsent } from "../services/crash-reporting";

const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ??
  "https://lucide.app/privacy-policy";

/* ── Reusable settings primitives ── */

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6 px-4">
      <Text className="font-display-medium text-xs text-text-caption uppercase tracking-wide mb-2 ml-1">
        {title}
      </Text>
      <View className="bg-warm-gray rounded-2xl overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function SettingsRow({
  icon,
  iconColor = "#1B2A4A",
  label,
  description,
  value,
  onPress,
  trailing,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  last?: boolean;
}) {
  const inner = (
    <View
      className={`flex-row items-center px-4 py-3 ${!last ? "border-b border-black/5" : ""}`}
    >
      <View className="w-8 h-8 rounded-lg items-center justify-center mr-3 bg-white/60">
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="font-body-medium text-sm text-civic-navy">
          {label}
        </Text>
        {description && (
          <Text className="font-body text-xs text-text-caption mt-0.5">
            {description}
          </Text>
        )}
      </View>
      {value && (
        <Text className="font-body text-sm text-text-caption ml-2">
          {value}
        </Text>
      )}
      {trailing}
      {onPress && !trailing && (
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={{ minHeight: 44 }}
        accessibilityRole="button"
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}

/* ── Screen ── */

export default function SettingsScreen() {
  const { t } = useTranslation("settings");
  const router = useRouter();
  const crashReportingOptIn = useAppStore((s) => s.crashReportingOptIn);
  const setCrashReportingOptIn = useAppStore((s) => s.setCrashReportingOptIn);
  const [exporting, setExporting] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const handleExport = async () => {
    try {
      setExporting(true);
      const fileUri = await generateExport();
      await shareExport(fileUri);
    } catch {
      Alert.alert(t("data.exportError"), t("data.exportErrorDetail"));
    } finally {
      setExporting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(t("data.deleteConfirmTitle"), t("data.deleteConfirmMessage"), [
      { text: t("data.deleteCancel"), style: "cancel" },
      {
        text: t("data.deleteConfirmButton"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAllUserData();
            router.replace("/privacy-consent");
          } catch {
            Alert.alert("Erreur", t("data.deleteError"));
          }
        },
      },
    ]);
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
        {/* ── Mon compte ── */}
        <SettingsGroup title={t("account.title")}>
          <SettingsRow
            icon="download-outline"
            label={t("account.export")}
            description={
              exporting
                ? t("account.exporting")
                : t("account.exportDescription")
            }
            onPress={exporting ? undefined : handleExport}
            last
          />
        </SettingsGroup>

        {/* ── À propos ── */}
        <SettingsGroup title={t("about.title")}>
          <SettingsRow
            icon="information-circle-outline"
            label={t("about.version")}
            value={appVersion}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label={t("about.privacy")}
            onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
          />
          <SettingsRow
            icon="document-text-outline"
            label={t("about.terms")}
            onPress={() => WebBrowser.openBrowserAsync("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")}
          />
          <SettingsRow
            icon="bug-outline"
            label={t("about.crashReports")}
            description={t("about.crashReportsDescription")}
            trailing={
              <Switch
                value={crashReportingOptIn}
                onValueChange={handleToggleCrashReporting}
                trackColor={{ false: "#D1D5DB", true: "#1B2A4A" }}
                accessibilityLabel={t("about.crashReports")}
              />
            }
            last
          />
        </SettingsGroup>

        {/* ── Zone dangereuse ── */}
        <View className="px-4 mt-4">
          <Pressable
            onPress={confirmDelete}
            className="bg-red-50 rounded-2xl px-4 py-4 flex-row items-center"
            style={{ minHeight: 44 }}
            accessibilityRole="button"
          >
            <View className="w-8 h-8 rounded-lg items-center justify-center mr-3 bg-red-100">
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </View>
            <View className="flex-1">
              <Text className="font-body-medium text-sm text-red-700">
                {t("danger.delete")}
              </Text>
              <Text className="font-body text-xs text-red-400 mt-0.5">
                {t("danger.deleteDescription")}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* ── Credits ── */}
        <Text className="font-body text-xs text-text-caption text-center mt-8 mb-4">
          {t("about.credits")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
