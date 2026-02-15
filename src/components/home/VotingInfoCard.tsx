import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { ElectionLogistics } from "../../data/schema";

interface VotingInfoCardProps {
  logistics: ElectionLogistics;
}

export function VotingInfoCard({ logistics }: VotingInfoCardProps) {
  const { t } = useTranslation("home");
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="mx-4 bg-warm-gray rounded-xl p-4">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between"
        accessibilityRole="button"
        accessibilityLabel={t("votingInfo")}
        accessibilityState={{ expanded }}
      >
        <Text className="font-display-semibold text-base text-civic-navy">
          {t("votingInfo")}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#1B2A4A"
        />
      </Pressable>

      {expanded && (
        <View className="mt-3 gap-3">
          {logistics.keyDates.length > 0 && (
            <View>
              <Text className="font-body-medium text-sm text-civic-navy mb-1">
                {t("keyDates")}
              </Text>
              {logistics.keyDates.map((date) => (
                <View key={date.label} className="flex-row justify-between py-1">
                  <Text className="font-body text-sm text-text-body">{date.label}</Text>
                  <Text className="font-body-medium text-sm text-civic-navy">
                    {date.date}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {logistics.eligibility.length > 0 && (
            <View>
              <Text className="font-body-medium text-sm text-civic-navy mb-1">
                {t("eligibility")}
              </Text>
              {logistics.eligibility.map((step) => (
                <Text key={step.order} className="font-body text-sm text-text-body py-0.5">
                  {"\u2022"} {step.text}
                </Text>
              ))}
            </View>
          )}

          {logistics.votingMethods.length > 0 && (
            <View>
              <Text className="font-body-medium text-sm text-civic-navy mb-1">
                {t("votingMethods")}
              </Text>
              {logistics.votingMethods.map((method) => (
                <Text key={method.type} className="font-body text-sm text-text-body py-0.5">
                  {"\u2022"} {method.description}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
