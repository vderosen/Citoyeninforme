import { Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { SourceReference } from "../../data/schema";

interface TrustBadgeProps {
  variant: "source" | "non_documente" | "incertain";
  source?: SourceReference;
  onPress?: () => void;
}

const variantStyles = {
  source: "bg-green-100 border-green-300",
  non_documente: "bg-gray-100 border-gray-300",
  incertain: "bg-amber-100 border-amber-300",
} as const;

const variantTextStyles = {
  source: "text-green-800",
  non_documente: "text-gray-600",
  incertain: "text-amber-800",
} as const;

export function TrustBadge({ variant, source, onPress }: TrustBadgeProps) {
  const { t } = useTranslation("common");

  const label =
    variant === "source" && source
      ? source.title
      : variant === "non_documente"
        ? t("badgeNonDocumente")
        : variant === "incertain"
          ? t("badgeIncertain")
          : t("badgeSource");

  const isInteractive = variant === "source" && onPress;

  const badge = (
    <Text
      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${variantStyles[variant]} ${variantTextStyles[variant]}`}
      accessibilityRole={isInteractive ? "link" : "text"}
      accessibilityLabel={label}
    >
      {label}
    </Text>
  );

  if (isInteractive) {
    return (
      <Pressable onPress={onPress} hitSlop={8}>
        {badge}
      </Pressable>
    );
  }

  return badge;
}
