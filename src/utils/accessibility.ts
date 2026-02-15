import { AccessibilityInfo, Platform } from "react-native";

export function announceForAccessibility(message: string): void {
  if (Platform.OS === "web") return;
  AccessibilityInfo.announceForAccessibility(message);
}

export const a11yRole = {
  button: { accessibilityRole: "button" as const },
  heading: { accessibilityRole: "header" as const },
  link: { accessibilityRole: "link" as const },
  image: { accessibilityRole: "image" as const },
  tab: { accessibilityRole: "tab" as const },
  list: { accessibilityRole: "list" as const },
};

export const MIN_TOUCH_TARGET = 44;
