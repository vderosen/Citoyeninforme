import { Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useChatbotStore } from "../../stores/chatbot";

export function ChatbotFAB() {
  const { t } = useTranslation("chatbot");
  const status = useChatbotStore((s) => s.status);
  const open = useChatbotStore((s) => s.open);
  const close = useChatbotStore((s) => s.close);

  const handlePress = () => {
    if (status === "closed") {
      open();
    } else {
      close();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={
        status === "closed" ? t("openChat") : t("closeChat")
      }
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 items-center justify-center shadow-lg"
      style={{ elevation: 8, zIndex: 50 }}
    >
      <Text className="text-white text-2xl">
        {status === "closed" ? "💬" : "✕"}
      </Text>
    </Pressable>
  );
}
