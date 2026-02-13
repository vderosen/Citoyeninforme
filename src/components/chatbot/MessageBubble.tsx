import { View, Text } from "react-native";
import { SourceReference } from "../ui/SourceReference";
import type { ChatMessage } from "../../stores/chatbot";

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
        <View className="mt-1 px-2">
          {message.sources.map((source, index) => (
            <SourceReference
              key={index}
              source={{
                title: source.title,
                url: source.url,
                type: "program",
                accessDate: "",
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
