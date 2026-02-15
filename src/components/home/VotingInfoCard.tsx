import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { ElectionLogistics } from "../../data/schema";

interface VotingInfoCardProps {
  logistics: ElectionLogistics;
}

export function VotingInfoCard({ logistics }: VotingInfoCardProps) {
  const { t } = useTranslation("home");
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="mx-4 bg-gray-50 rounded-xl p-4">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={t("votingInfo")}
        accessibilityState={{ expanded }}
      >
        <Text className="text-base font-semibold text-gray-900">
          {t("votingInfo")}
        </Text>
      </Pressable>

      {expanded && (
        <View className="mt-3 gap-3">
          {logistics.keyDates.length > 0 && (
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                {t("keyDates")}
              </Text>
              {logistics.keyDates.map((date) => (
                <View key={date.label} className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">{date.label}</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {date.date}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {logistics.eligibility.length > 0 && (
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                {t("eligibility")}
              </Text>
              {logistics.eligibility.map((step) => (
                <Text key={step.order} className="text-sm text-gray-600 py-0.5">
                  • {step.text}
                </Text>
              ))}
            </View>
          )}

          {logistics.votingMethods.length > 0 && (
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                {t("votingMethods")}
              </Text>
              {logistics.votingMethods.map((method) => (
                <Text key={method.type} className="text-sm text-gray-600 py-0.5">
                  • {method.description}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
