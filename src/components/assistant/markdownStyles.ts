import { StyleSheet } from "react-native";

export const markdownStyles = StyleSheet.create({
  heading1: {
    fontFamily: "SpaceGrotesk_600SemiBold",
    color: "#1B2A4A",
    fontSize: 18,
    marginTop: 12,
    marginBottom: 6,
  },
  heading2: {
    fontFamily: "SpaceGrotesk_500Medium",
    color: "#1B2A4A",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  heading3: {
    fontFamily: "SpaceGrotesk_500Medium",
    color: "#1B2A4A",
    fontSize: 15,
    marginTop: 8,
    marginBottom: 4,
  },
  body: {
    fontFamily: "Inter_400Regular",
    color: "#3D3D3D",
    fontSize: 16,
    lineHeight: 24,
  },
  strong: {
    fontFamily: "Inter_500Medium",
  },
  link: {
    color: "#E8553A",
  },
  bullet_list: {
    marginLeft: 4,
  },
  ordered_list: {
    marginLeft: 4,
  },
  list_item: {
    marginBottom: 4,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  code_inline: {
    fontFamily: "monospace",
    backgroundColor: "#F0EDE8",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    fontSize: 14,
  },
  fence: {
    fontFamily: "monospace",
    backgroundColor: "#F0EDE8",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginVertical: 8,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#E8553A",
    paddingLeft: 12,
    marginLeft: 0,
    opacity: 0.9,
  },
});
