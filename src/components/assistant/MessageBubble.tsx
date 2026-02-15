import { View, Text } from "react-native";
import type { ChatMessage } from "../../stores/assistant";
import { TrustBadge } from "../shared/TrustBadge";
import { SourceReference } from "../shared/SourceReference";

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  return (
    <View
      className={`mb-3 max-w-[85%] ${isUser ? "self-end" : "self-start"}`}
    >
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser ? "bg-blue-600" : "bg-gray-100"
        }`}
      >
        <Text
          className={`text-base ${isUser ? "text-white" : "text-gray-800"}`}
        >
          {message.content}
          {isStreaming && "▋"}
        </Text>
      </View>

      {message.sources && message.sources.length > 0 && (
        <View className="mt-1 px-2 gap-1">
          {message.sources.map((source, index) => (
            <View key={index} className="flex-row items-center gap-1">
              <TrustBadge
                variant="source"
                source={{
                  title: source.title,
                  url: source.url,
                  type: "program",
                  accessDate: "",
                }}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
