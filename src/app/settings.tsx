import { View, Text, ScrollView, Alert, Pressable, Linking, Modal } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { deleteAllUserData } from "../services/data-export";

const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ??
  "https://citoyeninforme.fr/politique-de-confidentialite";

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

/* ── À propos modal ── */

function AboutModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation("settings");
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-warm-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-black/5">
          <Text className="font-display-semibold text-lg text-civic-navy">{t("about.title")}</Text>
          <Pressable
            onPress={onClose}
            className="w-8 h-8 rounded-full bg-warm-gray items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <Ionicons name="close" size={18} color="#1B2A4A" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingVertical: 24, gap: 24 }}>
          {/* Description */}
          <View className="bg-warm-gray rounded-2xl p-4">
            <Text className="font-body text-sm text-text-body leading-relaxed">
              {t("about.description")}
            </Text>
          </View>

          {/* Contact */}
          <View>
            <Text className="font-display-medium text-xs text-text-caption uppercase tracking-wide mb-2 ml-1">
              {t("about.contactTitle")}
            </Text>
            <View className="bg-warm-gray rounded-2xl p-4">
              <Text className="font-body text-sm text-text-body mb-3">
                {t("about.contactDescription")}
              </Text>
              <Pressable
                onPress={() => Linking.openURL(`mailto:${t("about.contactEmail")}`)}
                className="flex-row items-center gap-2"
                accessibilityRole="link"
              >
                <Ionicons name="mail-outline" size={16} color="#0A66C2" />
                <Text className="font-body-medium text-sm text-blue-600 underline">
                  {t("about.contactEmail")}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Créateur */}
          <View>
            <Text className="font-display-medium text-xs text-text-caption uppercase tracking-wide mb-2 ml-1">
              {t("about.createdBy")}
            </Text>
            <Pressable
              onPress={() => Linking.openURL("https://www.linkedin.com/in/vassiliderosen/")}
              className="bg-warm-gray rounded-2xl p-4 flex-row items-center gap-3"
              accessibilityRole="link"
            >
              <View className="w-9 h-9 rounded-lg items-center justify-center bg-[#0A66C2]">
                <Ionicons name="logo-linkedin" size={18} color="white" />
              </View>
              <View className="flex-1">
                <Text className="font-body-medium text-sm text-civic-navy">
                  {t("about.creatorName")}
                </Text>
                <Text className="font-body text-xs text-text-caption mt-0.5">linkedin.com/in/vassiliderosen</Text>
              </View>
              <Ionicons name="open-outline" size={14} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Version */}
          <View className="items-center pt-2">
            <Text className="font-body text-xs text-text-caption">
              {t("about.version")} {appVersion}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/* ── Méthodologie modal ── */

function MethodologySection({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <View className="bg-warm-gray rounded-2xl p-4">
      <Text className="font-display-semibold text-sm text-civic-navy mb-1.5">
        {title}
      </Text>
      <Text className="font-body text-sm text-text-body leading-relaxed">
        {body}
      </Text>
    </View>
  );
}

function MethodologyModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation("settings");

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-warm-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-black/5">
          <Text className="font-display-semibold text-lg text-civic-navy">{t("methodology.title")}</Text>
          <Pressable
            onPress={onClose}
            className="w-8 h-8 rounded-full bg-warm-gray items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <Ionicons name="close" size={18} color="#1B2A4A" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingVertical: 24, gap: 16 }}>
          <MethodologySection title={t("methodology.motivationTitle")} body={t("methodology.motivationBody")} />
          <MethodologySection title={t("methodology.sourcesTitle")} body={t("methodology.sourcesBody")} />
          <MethodologySection title={t("methodology.proposalsTitle")} body={t("methodology.proposalsBody")} />
          <MethodologySection title={t("methodology.fairnessTitle")} body={t("methodology.fairnessBody")} />
          <MethodologySection title={t("methodology.aiTitle")} body={t("methodology.aiBody")} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/* ── Screen ── */

export default function SettingsScreen() {
  const { t } = useTranslation("settings");
  const router = useRouter();
  const [aboutVisible, setAboutVisible] = useState(false);
  const [methodologyVisible, setMethodologyVisible] = useState(false);

  const confirmDelete = () => {
    Alert.alert(t("data.deleteConfirmTitle"), t("data.deleteConfirmMessage"), [
      { text: t("data.deleteCancel"), style: "cancel" },
      {
        text: t("data.deleteConfirmButton"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAllUserData();
            router.replace("/onboarding");
          } catch {
            Alert.alert("Erreur", t("data.deleteError"));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-white" edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        {/* ── À propos ── */}
        <SettingsGroup title={t("about.title")}>
          <SettingsRow
            icon="information-circle-outline"
            label={t("about.buttonLabel")}
            onPress={() => setAboutVisible(true)}
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
            last
          />
        </SettingsGroup>

        {/* ── Méthodologie ── */}
        <SettingsGroup title={t("methodology.groupTitle")}>
          <SettingsRow
            icon="bulb-outline"
            label={t("methodology.buttonLabel")}
            description="Sources, équité et IA"
            onPress={() => setMethodologyVisible(true)}
            last
          />
        </SettingsGroup>

        <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />
        <MethodologyModal visible={methodologyVisible} onClose={() => setMethodologyVisible(false)} />

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
