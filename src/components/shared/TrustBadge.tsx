import { Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { SourceReference } from "../../data/schema";

interface TrustBadgeProps {
  variant: "source" | "non_documente" | "incertain";
  source?: SourceReference;
  onPress?: () => void;
}

const variantStyles = {
  source: "bg-civic-navy-light border-civic-navy",
  non_documente: "bg-warm-gray border-warm-gray",
  incertain: "bg-accent-coral-light border-accent-coral",
} as const;

const variantTextStyles = {
  source: "text-civic-navy",
  non_documente: "text-text-caption",
  incertain: "text-accent-coral-dark",
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
      className={`text-xs font-body-medium px-2 py-0.5 rounded-full border ${variantStyles[variant]} ${variantTextStyles[variant]}`}
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
