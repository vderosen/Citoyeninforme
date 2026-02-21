import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { FeedbackAction } from "../shared/FeedbackAction";

export function CandidateFeedbackHeaderAction() {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="mr-4 p-2"
        accessibilityRole="button"
        accessibilityLabel={t("feedbackSignal")}
      >
        <Ionicons name="flag-outline" size={22} color="#FAFAF8" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-center"
          style={{ backgroundColor: "rgba(27,42,74,0.4)" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            onPress={() => setIsOpen(false)}
            className="absolute inset-0"
            accessibilityRole="button"
            accessibilityLabel={t("close")}
          />
          <View className="mx-5 rounded-3xl bg-warm-white px-5 pb-6 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-display-semibold text-lg text-civic-navy">
                {t("feedbackTitle")}
              </Text>
              <Pressable
                onPress={() => setIsOpen(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-warm-gray"
                accessibilityRole="button"
                accessibilityLabel={t("close")}
              >
                <Ionicons name="close" size={18} color="#1B2A4A" />
              </Pressable>
            </View>

            <FeedbackAction
              screen="candidate"
              initiallyOpen
              onDone={() => setIsOpen(false)}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
