import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type {
  ElectionLogistics,
  LogisticsDate,
  VotingMethod,
} from "../../data/schema";

// --- View-layer types (T002) ---

type TemporalStatus = "past" | "next" | "future";

interface TimelineEntry {
  date: string;
  formattedDate: string;
  labels: string[];
  status: TemporalStatus;
}

// --- Constants (T002) ---

const FRENCH_MONTHS = [
  "JAN", "FÉV", "MARS", "AVR", "MAI", "JUIN",
  "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC",
];

const VOTING_METHOD_CONFIG: Record<
  string,
  { icon: React.ComponentProps<typeof Ionicons>["name"]; titleKey: string }
> = {
  "in-person": { icon: "business-outline", titleKey: "votingMethod.inPerson" },
  proxy: { icon: "people-outline", titleKey: "votingMethod.proxy" },
  mail: { icon: "mail-outline", titleKey: "votingMethod.mail" },
};

const VOTING_METHOD_FALLBACK = {
  icon: "help-circle-outline" as React.ComponentProps<typeof Ionicons>["name"],
  titleKey: "votingMethod.other",
};

// --- Helpers (T003, T004) ---

function formatFrenchDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  const day = d.getDate();
  const month = FRENCH_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function groupAndClassifyDates(keyDates: LogisticsDate[]): TimelineEntry[] {
  const groups = new Map<string, string[]>();
  for (const item of keyDates) {
    const existing = groups.get(item.date);
    if (existing) {
      existing.push(item.label);
    } else {
      groups.set(item.date, [item.label]);
    }
  }

  const sortedDates = [...groups.keys()].sort();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let foundNext = false;
  return sortedDates.map((date) => {
    const entryDate = new Date(date + "T00:00:00");
    let status: TemporalStatus;
    if (entryDate < today) {
      status = "past";
    } else if (!foundNext) {
      status = "next";
      foundNext = true;
    } else {
      status = "future";
    }
    return {
      date,
      formattedDate: formatFrenchDate(date),
      labels: groups.get(date)!,
      status,
    };
  });
}

function mapVotingMethod(method: VotingMethod) {
  const config = VOTING_METHOD_CONFIG[method.type] ?? VOTING_METHOD_FALLBACK;
  return {
    type: method.type,
    icon: config.icon,
    titleKey: config.titleKey,
    description: method.description,
    requirements: method.requirements,
  };
}

// --- Component ---

interface VotingInfoCardProps {
  logistics: ElectionLogistics;
}

export function VotingInfoCard({ logistics }: VotingInfoCardProps) {
  const { t } = useTranslation("home");

  return (
    <View className="mx-4 gap-3">
      {/* Key Dates — Vertical Timeline (T005 / US1) */}
      {logistics.keyDates.length > 0 && (
        <View className="bg-warm-gray rounded-xl p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="calendar-outline" size={18} color="#1B2A4A" />
            <Text className="font-display-semibold text-sm text-civic-navy">
              {t("keyDates")}
            </Text>
          </View>

          <View className="relative">
            {/* Vertical line */}
            <View className="absolute left-[6px] top-1 bottom-1 w-[2px] bg-civic-navy opacity-[0.15]" />

            <View className="gap-4">
              {groupAndClassifyDates(logistics.keyDates).map((entry) => (
                <View key={entry.date} className="flex-row">
                  {/* Dot */}
                  <View className="w-[14px] items-center pt-[2px]">
                    {entry.status === "past" && (
                      <View className="w-3 h-3 rounded-full bg-text-caption" />
                    )}
                    {entry.status === "next" && (
                      <View className="w-[22px] h-[22px] rounded-full bg-accent-coral-light items-center justify-center -ml-[4px]">
                        <View className="w-[14px] h-[14px] rounded-full bg-accent-coral" />
                      </View>
                    )}
                    {entry.status === "future" && (
                      <View className="w-3 h-3 rounded-full border-2 border-civic-navy" />
                    )}
                  </View>

                  {/* Date badge + labels */}
                  <View className="flex-1 ml-2">
                    <Text className="font-display-semibold text-xs text-civic-navy">
                      {entry.formattedDate}
                    </Text>
                    <Text className="font-body text-sm text-text-body mt-0.5">
                      {entry.labels.join(" · ")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Eligibility — Numbered Sub-Cards (T006 / US2) */}
      {logistics.eligibility.length > 0 && (
        <View className="bg-warm-gray rounded-xl p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#1B2A4A"
            />
            <Text className="font-display-semibold text-sm text-civic-navy">
              {t("eligibility")}
            </Text>
          </View>

          <View className="gap-2">
            {logistics.eligibility.map((step) => (
              <View
                key={step.order}
                className="bg-white rounded-lg p-3 flex-row items-start gap-3"
              >
                <View className="w-6 h-6 rounded-full bg-civic-navy items-center justify-center">
                  <Text className="font-display-semibold text-xs text-white">
                    {step.order}
                  </Text>
                </View>
                <Text className="font-body text-sm text-text-body flex-1 shrink">
                  {step.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Voting Methods — Icon Sub-Cards (T007 / US3) */}
      {logistics.votingMethods.length > 0 && (
        <View className="bg-warm-gray rounded-xl p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons
              name="document-text-outline"
              size={18}
              color="#1B2A4A"
            />
            <Text className="font-display-semibold text-sm text-civic-navy">
              {t("votingMethods")}
            </Text>
          </View>

          <View className="gap-2">
            {logistics.votingMethods.map((method) => {
              const display = mapVotingMethod(method);
              return (
                <View key={display.type} className="bg-white rounded-lg p-3">
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name={display.icon}
                      size={20}
                      color="#1B2A4A"
                    />
                    <Text className="font-display-semibold text-sm text-civic-navy">
                      {t(display.titleKey)}
                    </Text>
                  </View>
                  <Text className="font-body text-sm text-text-body mt-1">
                    {display.description}
                  </Text>
                  {display.requirements && (
                    <View className="flex-row items-start gap-1 mt-2">
                      <Ionicons
                        name="information-circle-outline"
                        size={14}
                        color="#6B7280"
                        style={{ marginTop: 1 }}
                      />
                      <Text className="font-body text-xs text-text-caption flex-1">
                        {display.requirements}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
