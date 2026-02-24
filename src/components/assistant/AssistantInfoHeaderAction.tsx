import { useState } from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export function AssistantInfoHeaderAction() {
  const { t } = useTranslation("assistant");
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        className="ml-2 p-2"
        accessibilityRole="button"
        accessibilityLabel={t("infoTitle")}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#FAFAF8" />
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-warm-white">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2 border-b border-black/5">
            <Text className="font-display-semibold text-lg text-civic-navy">
              {t("infoTitle")}
            </Text>
            <Pressable
              onPress={() => setVisible(false)}
              className="w-8 h-8 rounded-full bg-warm-gray items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel={t("infoClose")}
            >
              <Ionicons name="close" size={18} color="#1B2A4A" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingVertical: 24, gap: 20 }}>
            {/* Icône centrale */}
            <View className="items-center py-4">
              <View
                className="items-center justify-center rounded-full bg-accent-coral"
                style={{ width: 56, height: 56 }}
              >
                <Ionicons name="sparkles" size={26} color="#FAFAF8" />
              </View>
            </View>

            {/* Comment ça fonctionne */}
            <View>
              <View className="flex-row items-center gap-2 mb-2 ml-1">
                <Ionicons name="library-outline" size={14} color="#6B7280" />
                <Text className="font-display-medium text-xs text-text-caption uppercase tracking-wide">
                  {t("infoHow")}
                </Text>
              </View>
              <View className="bg-warm-gray rounded-2xl p-4">
                <Text className="font-body text-sm text-text-body leading-relaxed">
                  {t("infoHowText")}
                </Text>
              </View>
            </View>

            {/* Avertissement */}
            <View>
              <View className="flex-row items-center gap-2 mb-2 ml-1">
                <Ionicons name="warning-outline" size={14} color="#D97706" />
                <Text className="font-display-medium text-xs text-text-caption uppercase tracking-wide">
                  {t("infoDisclaimer")}
                </Text>
              </View>
              <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <Text className="font-body text-sm text-amber-900 leading-relaxed">
                  {t("infoDisclaimerText")}
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
