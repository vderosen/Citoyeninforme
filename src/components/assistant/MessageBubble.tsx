import { View, Text } from "react-native";
import type { ChatMessage } from "../../stores/assistant";
import { TrustBadge } from "../shared/TrustBadge";

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
}

const USER_BUBBLE_COLOR = "#1E2A44"; // civic-navy
const ASSISTANT_BUBBLE_COLOR = "#FFFFFF"; // Solid white for legibility
const BUBBLE_R = 24;
const POINTED_CORNER_R = 6;

function simplifyMarkdown(content: string): string {
  return content
    .replace(/```([\s\S]*?)```/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/~~(.*?)~~/g, "$1");
}

function BubbleShape({
  side,
  fillColor,
  shadow,
  children,
}: {
  side: "left" | "right";
  fillColor: string;
  shadow?: {
    color: string;
    offset: { width: number; height: number };
    opacity: number;
    radius: number;
    elevation: number;
  };
  children: React.ReactNode;
}) {
  const isRight = side === "right";

  return (
    <View
      style={{
        marginBottom: 4,
        backgroundColor: fillColor,
        borderTopLeftRadius: BUBBLE_R,
        borderTopRightRadius: BUBBLE_R,
        borderBottomLeftRadius: isRight ? BUBBLE_R : POINTED_CORNER_R,
        borderBottomRightRadius: isRight ? POINTED_CORNER_R : BUBBLE_R,
        paddingHorizontal: 16,
        paddingVertical: 12,
        ...(shadow && {
          shadowColor: shadow.color,
          shadowOffset: shadow.offset,
          shadowOpacity: shadow.opacity,
          shadowRadius: shadow.radius,
          elevation: shadow.elevation,
        }),
      }}
    >
      {children}
    </View>
  );
}

function AssistantContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const normalized = simplifyMarkdown(content);
  const displayContent = isStreaming ? normalized + " ▋" : normalized;

  return (
    <Text selectable className="font-body text-base text-text-body">
      {displayContent}
    </Text>
  );
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  if (!isUser && !message.content) return null;

  return (
    <View
      className={`mb-3 ${isUser ? "max-w-[85%] self-end" : ""}`}
    >
      {isUser ? (
        <BubbleShape
          side="right"
          fillColor={USER_BUBBLE_COLOR}
        >
          <Text selectable className="font-body text-base text-text-inverse">
            {message.content}
          </Text>
        </BubbleShape>
      ) : (
        <View className="px-4 py-2">
          <AssistantContent content={message.content} isStreaming={isStreaming} />
        </View>
      )}
    </View>
  );
}
