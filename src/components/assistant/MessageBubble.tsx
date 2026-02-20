import { View, Text } from "react-native";
import Markdown, { type RenderRules } from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import type { ChatMessage } from "../../stores/assistant";
import { TrustBadge } from "../shared/TrustBadge";
import { markdownStyles } from "./markdownStyles";

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
}

const USER_BUBBLE_COLOR = "#1B2A4A";
const ASSISTANT_BUBBLE_COLOR = "#F2F4F7";
const TAIL_SIZE = 14;

const selectableMarkdownRules: RenderRules = {
  text: (node: any, _children: any, _parent: any, styles: any, inheritedStyles: any = {}) => (
    <Text key={node.key} selectable style={[inheritedStyles, styles.text]}>
      {node.content}
    </Text>
  ),
  textgroup: (node: any, children: any, _parent: any, styles: any) => (
    <Text key={node.key} selectable style={styles.textgroup}>
      {children}
    </Text>
  ),
  strong: (node: any, children: any, _parent: any, styles: any) => (
    <Text key={node.key} selectable style={styles.strong}>
      {children}
    </Text>
  ),
  em: (node: any, children: any, _parent: any, styles: any) => (
    <Text key={node.key} selectable style={styles.em}>
      {children}
    </Text>
  ),
  s: (node: any, children: any, _parent: any, styles: any) => (
    <Text key={node.key} selectable style={styles.s}>
      {children}
    </Text>
  ),
  code_inline: (node: any, _children: any, _parent: any, styles: any, inheritedStyles: any = {}) => (
    <Text key={node.key} selectable style={[inheritedStyles, styles.code_inline]}>
      {node.content}
    </Text>
  ),
  code_block: (node: any, _children: any, _parent: any, styles: any, inheritedStyles: any = {}) => (
    <Text key={node.key} selectable style={[inheritedStyles, styles.code_block]}>
      {node.content}
    </Text>
  ),
  fence: (node: any, _children: any, _parent: any, styles: any, inheritedStyles: any = {}) => (
    <Text key={node.key} selectable style={[inheritedStyles, styles.fence]}>
      {node.content}
    </Text>
  ),
  inline: (node: any, children: any, _parent: any, styles: any) => (
    <Text key={node.key} selectable style={styles.inline}>
      {children}
    </Text>
  ),
  span: (node: any, children: any, _parent: any, styles: any) => (
    <Text key={node.key} selectable style={styles.span}>
      {children}
    </Text>
  ),
  hardbreak: (node: any, _children: any, _parent: any, styles: any) => (
    <Text key={node.key} selectable style={styles.hardbreak}>
      {"\n"}
    </Text>
  ),
  softbreak: (node: any, _children: any, _parent: any, styles: any) => (
    <Text key={node.key} selectable style={styles.softbreak}>
      {"\n"}
    </Text>
  ),
};

function BubbleTail({
  side,
  bubbleColor,
}: {
  side: "left" | "right";
  bubbleColor: string;
}) {
  const isLeft = side === "left";

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: -5,
        width: TAIL_SIZE,
        height: TAIL_SIZE,
        backgroundColor: bubbleColor,
        borderRadius: 5,
        transform: [{ rotate: isLeft ? "-35deg" : "35deg" }],
        ...(isLeft ? { left: 14 } : { right: 14 }),
      }}
    />
  );
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
      <Markdown style={markdownStyles} rules={selectableMarkdownRules}>
        {displayContent}
      </Markdown>
    );
  } catch {
    return (
      <Text selectable className="font-body text-base text-text-body">
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
      className={`mb-3 ${isUser ? "max-w-[85%] self-end" : ""}`}
    >
      {isUser ? (
        <View className="relative mb-1">
          <View
            className="rounded-2xl px-4 py-3"
            style={{ backgroundColor: USER_BUBBLE_COLOR }}
          >
            <Text selectable className="font-body text-base text-text-inverse">
              {message.content}
            </Text>
          </View>
          <BubbleTail
            side="right"
            bubbleColor={USER_BUBBLE_COLOR}
          />
        </View>
      ) : (
        <View className="flex-row items-start gap-2">
          <View className="w-6 h-6 rounded-full bg-civic-navy items-center justify-center mt-1">
            <Ionicons name="sparkles-outline" size={14} color="#FAFAF8" />
          </View>
          <View className="relative flex-1 mb-1">
            <View
              className="flex-1 rounded-2xl px-4 py-3"
              style={{
                backgroundColor: ASSISTANT_BUBBLE_COLOR,
                shadowColor: "#1B2A4A",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <AssistantContent content={message.content} isStreaming={isStreaming} />
            </View>
            <BubbleTail
              side="left"
              bubbleColor={ASSISTANT_BUBBLE_COLOR}
            />
          </View>
        </View>
      )}

      {timeStr !== "" && (
        <Text
          className={`text-xs text-text-caption mt-2 ${
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
