import { View, Text } from "react-native";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import type { ChatMessage } from "../../stores/assistant";
import { TrustBadge } from "../shared/TrustBadge";
import { markdownStyles } from "./markdownStyles";

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
}

function AssistantContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const displayContent = isStreaming ? content + " ▋" : content;

  try {
    return (
      <Markdown style={markdownStyles}>
        {displayContent}
      </Markdown>
    );
  } catch {
    return (
      <Text className="font-body text-base text-text-body">
        {displayContent}
      </Text>
    );
  }
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  if (!isUser && !message.content) return null;

  const timeStr = formatTimestamp(message.timestamp);

  return (
    <View
      className={`mb-3 max-w-[85%] ${isUser ? "self-end" : "self-start"}`}
    >
      {isUser ? (
        <View className="rounded-2xl px-4 py-3 bg-civic-navy">
          <Text className="font-body text-base text-text-inverse">
            {message.content}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-start gap-2">
          <View className="w-6 h-6 rounded-full bg-civic-navy items-center justify-center mt-1">
            <Ionicons name="sparkles-outline" size={14} color="#FAFAF8" />
          </View>
          <View
            className="flex-1 rounded-2xl px-4 py-3 bg-white"
            style={{
              shadowColor: "#1B2A4A",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <AssistantContent content={message.content} isStreaming={isStreaming} />
          </View>
        </View>
      )}

      {timeStr !== "" && (
        <Text
          className={`text-xs text-text-caption mt-1 ${
            isUser ? "text-right" : "ml-8"
          }`}
        >
          {timeStr}
        </Text>
      )}

      {message.sources && message.sources.length > 0 && (
        <View className={`mt-1 gap-1 ${isUser ? "px-2" : "ml-8"}`}>
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
