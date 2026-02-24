import { View, Text } from "react-native";
import Markdown, { type RenderRules } from "react-native-markdown-display";
import type { ChatMessage } from "../../stores/assistant";
import { TrustBadge } from "../shared/TrustBadge";
import { markdownStyles } from "./markdownStyles";

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
}

const USER_BUBBLE_COLOR = "#1E2A44"; // civic-navy
const ASSISTANT_BUBBLE_COLOR = "#FFFFFF"; // Solid white for legibility
const BUBBLE_R = 24;
const POINTED_CORNER_R = 6;

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

  return (
    <View
      className={`mb-3 ${isUser ? "max-w-[85%] self-end" : ""}`}
    >
      <BubbleShape
        side={isUser ? "right" : "left"}
        fillColor={isUser ? USER_BUBBLE_COLOR : ASSISTANT_BUBBLE_COLOR}
        shadow={
          isUser
            ? undefined
            : {
              color: "#1B2A4A",
              offset: { width: 0, height: 2 },
              opacity: 0.08,
              radius: 6,
              elevation: 3,
            }
        }
      >
        {isUser ? (
          <Text selectable className="font-body text-base text-text-inverse">
            {message.content}
          </Text>
        ) : (
          <AssistantContent content={message.content} isStreaming={isStreaming} />
        )}
      </BubbleShape>
    </View>
  );
}
