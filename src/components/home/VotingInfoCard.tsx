import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { ElectionLogistics } from "../../data/schema";

interface VotingInfoCardProps {
  logistics: ElectionLogistics;
}

export function VotingInfoCard({ logistics }: VotingInfoCardProps) {
  const { t } = useTranslation("home");

  return (
    <View className="mx-4 gap-3">
      {logistics.keyDates.length > 0 && (
        <View className="bg-warm-gray rounded-xl p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="calendar-outline" size={18} color="#1B2A4A" />
            <Text className="font-display-semibold text-sm text-civic-navy">
              {t("keyDates")}
            </Text>
          </View>
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
        <View className="bg-warm-gray rounded-xl p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="checkmark-circle-outline" size={18} color="#1B2A4A" />
            <Text className="font-display-semibold text-sm text-civic-navy">
              {t("eligibility")}
            </Text>
          </View>
          {logistics.eligibility.map((step) => (
            <Text key={step.order} className="font-body text-sm text-text-body py-0.5">
              {"\u2022"} {step.text}
            </Text>
          ))}
        </View>
      )}

      {logistics.votingMethods.length > 0 && (
        <View className="bg-warm-gray rounded-xl p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="document-text-outline" size={18} color="#1B2A4A" />
            <Text className="font-display-semibold text-sm text-civic-navy">
              {t("votingMethods")}
            </Text>
          </View>
          {logistics.votingMethods.map((method) => (
            <Text key={method.type} className="font-body text-sm text-text-body py-0.5">
              {"\u2022"} {method.description}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
